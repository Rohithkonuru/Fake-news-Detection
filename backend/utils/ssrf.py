import ipaddress
import socket
from urllib.parse import urlparse
import httpx

# Blocked subnets including RFC 1918, RFC 3927 (link-local/cloud metadata), loopback, carrier-grade NAT, etc.
BLOCKED_NETWORKS = [
    ipaddress.ip_network("127.0.0.0/8"),       # Loopback
    ipaddress.ip_network("10.0.0.0/8"),        # Private RFC 1918
    ipaddress.ip_network("172.16.0.0/12"),     # Private RFC 1918
    ipaddress.ip_network("192.168.0.0/16"),    # Private RFC 1918
    ipaddress.ip_network("169.254.0.0/16"),    # Link-local / Cloud metadata (AWS, GCP, Azure)
    ipaddress.ip_network("100.64.0.0/10"),     # Carrier-grade NAT
    ipaddress.ip_network("192.0.2.0/24"),      # Documentation / TEST-NET-1
    ipaddress.ip_network("198.51.100.0/24"),   # Documentation / TEST-NET-2
    ipaddress.ip_network("203.0.113.0/24"),    # Documentation / TEST-NET-3
    ipaddress.ip_network("224.0.0.0/4"),       # Multicast
    ipaddress.ip_network("240.0.0.0/4"),       # Reserved
    ipaddress.ip_network("0.0.0.0/8"),         # Broadcast / current network
    ipaddress.ip_network("::1/128"),           # IPv6 Loopback
    ipaddress.ip_network("fc00::/7"),          # IPv6 Unique local
    ipaddress.ip_network("fe80::/10"),         # IPv6 Link-local
]

def is_ip_allowed(ip_str: str) -> bool:
    try:
        ip = ipaddress.ip_address(ip_str)
        for net in BLOCKED_NETWORKS:
            if ip in net:
                return False
        return True
    except ValueError:
        return False

def is_safe_url(url: str) -> tuple[bool, str]:
    """
    Validates that a URL is safe to fetch and protects against SSRF attacks.
    Returns (is_safe, error_message).
    """
    if not url or not isinstance(url, str):
        return False, "URL is empty or invalid."
    
    url = url.strip()
    try:
        parsed = urlparse(url)
    except Exception:
        return False, "Malformed URL format."
        
    if parsed.scheme not in ("http", "https"):
        return False, f"Unsupported scheme '{parsed.scheme}'. Only HTTP and HTTPS are allowed."
        
    hostname = parsed.hostname
    if not hostname:
        return False, "No valid hostname found in URL."
        
    # Check for localhost aliases
    if hostname.lower() in ("localhost", "localhost.localdomain", "broadcasthost"):
        return False, "Access to localhost is prohibited."

    # Validate port if specified
    if parsed.port and parsed.port not in (80, 443, 8080):
        return False, f"Port {parsed.port} is blocked for security reasons."

    # Resolve IP addresses to prevent DNS rebinding
    try:
        addr_info = socket.getaddrinfo(hostname, None)
        resolved_ips = {item[4][0] for item in addr_info}
    except socket.gaierror:
        return False, f"Could not resolve host '{hostname}'."
    except Exception as e:
        return False, f"DNS resolution failed: {str(e)}"
        
    for ip_str in resolved_ips:
        if not is_ip_allowed(ip_str):
            return False, f"Host '{hostname}' resolves to a restricted internal IP address ({ip_str})."

    return True, ""

async def safe_fetch_url(url: str, timeout: float = 8.0, max_bytes: int = 5_000_000) -> tuple[str, str]:
    """
    Safely fetches a web page with SSRF protection, size limits, and timeout.
    Returns (html_content, error_message).
    """
    is_safe, reason = is_safe_url(url)
    if not is_safe:
        return "", reason

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 (TruthLens Verification Engine/1.0)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9"
    }

    try:
        async with httpx.AsyncClient(timeout=timeout, follow_redirects=True, max_redirects=3) as client:
            resp = await client.get(url, headers=headers)
            
            # Check final redirected URL for SSRF as well
            final_safe, final_reason = is_safe_url(str(resp.url))
            if not final_safe:
                return "", f"Redirected to unsafe URL: {final_reason}"
                
            if resp.status_code >= 400:
                return "", f"Source returned HTTP {resp.status_code}"
                
            content = resp.text
            if len(content) > max_bytes:
                content = content[:max_bytes]
            return content, ""
    except httpx.TimeoutException:
        return "", "Request to source timed out."
    except httpx.RequestError as e:
        return "", f"Network connection error: {str(e)}"
    except Exception as e:
        return "", f"Failed to retrieve URL: {str(e)}"
