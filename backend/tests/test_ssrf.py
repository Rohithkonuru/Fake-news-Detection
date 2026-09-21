import pytest
from backend.utils.ssrf import is_safe_url, is_ip_allowed

def test_blocked_ip_ranges():
    # Loopback
    assert not is_ip_allowed("127.0.0.1")
    assert not is_ip_allowed("127.0.0.2")
    # RFC 1918 Private
    assert not is_ip_allowed("10.0.0.1")
    assert not is_ip_allowed("172.16.0.5")
    assert not is_ip_allowed("192.168.1.1")
    # Cloud metadata
    assert not is_ip_allowed("169.254.169.254")
    # Public IP should be allowed
    assert is_ip_allowed("8.8.8.8")
    assert is_ip_allowed("1.1.1.1")

def test_is_safe_url():
    # Dangerous schemes
    assert not is_safe_url("file:///etc/passwd")[0]
    assert not is_safe_url("ftp://example.com")[0]
    # Localhost
    assert not is_safe_url("http://localhost:8000")[0]
    assert not is_safe_url("http://127.0.0.1:27017")[0]
    # Disallowed ports
    assert not is_safe_url("http://google.com:22")[0]
    # Valid external URL
    is_safe, err = is_safe_url("https://www.nature.com/articles/sample")
    assert is_safe
    assert err == ""
