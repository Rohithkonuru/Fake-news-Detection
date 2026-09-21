"""
Generates a structured, balanced dataset for training and evaluating the ML Pattern Signal detector.
Features standard journalistic factual assertions vs sensationalist misinformation patterns.
"""
import os
import pandas as pd
from sklearn.model_selection import train_test_split

CREDIBLE_SAMPLES = [
    "NASA's James Webb Space Telescope detected carbon dioxide on exoplanet WASP-39 b.",
    "The World Health Organization confirmed an increase in seasonal influenza cases across Europe.",
    "Federal Reserve officials announced a 25 basis point reduction in the benchmark interest rate.",
    "Scientists at MIT developed a low-cost water filtration membrane using recycled plant cellulose.",
    "The European Space Agency launched the Euclid mission to study the geometry of dark energy.",
    "Global atmospheric carbon dioxide concentrations reached 424 parts per million according to NOAA.",
    "Clinical trials published in The Lancet indicate a new malaria vaccine demonstrates 77 percent efficacy.",
    "Renewable energy generation exceeded coal-fired electricity production in the European Union in 2023.",
    "Japan's meteorological agency issued high surf advisories following an offshore magnitude 6.2 earthquake.",
    "Researchers discovered fossil evidence of a previously unknown titanosaur species in Argentina.",
    "The Bank of England held interest rates steady citing persistent services inflation pressures.",
    "Astronomers identified an Earth-sized exoplanet orbiting within the habitable zone of star TOI-700.",
    "CDC reported that routine childhood vaccination rates remained above 93 percent nationwide.",
    "Oxford University researchers completed phase 3 safety trials for an updated booster formulation.",
    "The International Energy Agency projects global solar capacity additions will reach record highs this year.",
    "DeepMind released an updated AlphaFold model predicting molecular interactions with DNA and RNA.",
    "Geological survey teams recorded volcanic tremors preceding an eruption on the Reykjanes Peninsula.",
    "A peer-reviewed study in Nature Medicine analyzed cardiovascular outcomes across 50,000 participants.",
    "The United Nations Environment Programme released an assessment on global plastic pollution treaty negotiations.",
    "High-speed rail passenger volume in France grew by 8 percent over the previous calendar year.",
    "The FDA approved a new gene therapy treatment for sickle cell disease in adult patients.",
    "CERN physicists announced precision measurements of the W boson mass consistent with the Standard Model.",
    "Singapore opened an expanded seawater desalination facility to bolster municipal water security.",
    "The Hubble Space Telescope observed a gravitational lens magnifying a distant supernova.",
    "Public health authorities confirmed that drinking adequate water and balanced nutrition support immune function.",
    "Researchers at Stanford developed a battery electrolyte that operates reliably in subzero temperatures.",
    "The World Bank approved financing for climate resilience infrastructure across vulnerable Pacific island nations.",
    "Seismologists reported no immediate tsunami threat following a deep-focus tremor in the Tonga Trench.",
    "The US Department of Agriculture forecasted stable winter wheat yields despite regional drought concerns.",
    "Archaeologists uncovered 3,000-year-old bronze artifacts during a rescue excavation in northern Greece.",
    "WHO guidelines emphasize that regular aerobic exercise reduces the risk of chronic hypertension.",
    "Satellite imagery confirmed the steady calving of iceberg A-23a as it drifts through the Southern Ocean.",
    "An international consortium synthesized a biodegradable bioplastic derived from agricultural potato starch.",
    "The National Weather Service issued blizzard warnings for mountainous regions of the Pacific Northwest.",
    "Clinical data submitted to health regulators showed no statistically significant link between vaccines and autism.",
    "Atmospheric scientists found that the Antarctic ozone layer continues its gradual recovery trajectory.",
    "The Smithsonian National Zoo announced the arrival of giant pandas under a renewed cooperative breeding agreement.",
    "Electric vehicle registrations accounted for 22 percent of new car sales in Germany last quarter.",
    "Neuroscientists mapped synaptic connections across a cubic millimeter of human temporal cortex tissue.",
    "Marine biologists observed coral spawning events along the northern sections of the Great Barrier Reef."
]

MISINFORMATION_SAMPLES = [
    "SHOCKING PROOF: Drinking boiled garlic water cures 100% of all viral infections overnight!",
    "BANNED SECRET: Mainstream doctors don't want you to know this simple lemon juice trick melts cancerous tumors!",
    "5G cellular towers are transmitting frequencies specifically calibrated to alter human brainwaves and control thoughts!",
    "The government is secretly spraying mind-control lithium chemicals via commercial aircraft contrails!",
    "Miracle mineral solution cures autism and malaria in hours - health agencies are suppressing the truth!",
    "NASA scientist admits the Moon landing was filmed in an underground Hollywood bunker with Stanley Kubrick!",
    "Eating raw onions placed in socks while sleeping extracts deadly vaccine toxins directly through your feet!",
    "Microchips hidden inside flu shots connect your bloodstream to satellite tracking arrays!",
    "EXPOSED: Drinking industrial bleach completely destroys COVID-19 without any side effects!",
    "A secret elite group is artificially faking earthquakes with underwater sonic cannons to control coastal real estate!",
    "Big Pharma is terrified of this Himalayan root that regenerates lost teeth in seven days guaranteed!",
    "Wearing tin foil hats with copper wire completely blocks 5G government surveillance frequencies!",
    "Eating apple seeds cures terminal diabetes because vitamin B17 kills all diseased pancreatic cells!",
    "Whistleblower reveals the Earth is actually concave and the sun is an electrical hologram operated by NATO!",
    "Drinking silver colloidal water renders your immune system totally immortal against every known pathogen!",
    "This suppressed audio frequency will magically vibrate your pineal gland and cure chronic arthritis instantly!",
    "UNBELIEVABLE: Eating banana peels fried in olive oil cancels out the need for insulin injections!",
    "Secret documents show global satellite networks are beaming weather storms to manipulate stock markets!",
    "Putting garlic cloves in your ear canal cures pneumonia and restores lost hearing within 24 hours!",
    "They are hiding the real cure for cancer in an underground vault to protect pharmaceutical profits!",
    "Drinking magnetized ocean water reverses human aging by 20 years within three weeks!",
    "Baking soda and maple syrup combined creates an alkaline cure that annihilates leukemia cells overnight!",
    "Microwave ovens emit radioactive rays that scramble your DNA and turn healthy blood cells cancerous!",
    "Secret patent proves airplanes are dropping nano-robot dust to track citizens through domestic Wi-Fi routers!",
    "Carrots give humans hawk-like infrared night vision that the military has classified since World War II!",
    "Rubbing raw petroleum jelly on the chest eliminates all asthma symptoms permanently without medication!",
    "Ancient Egyptian pyramid frequency cures Alzheimer's disease - pharmaceutical companies filed a lawsuit to hide it!",
    "Drinking warm water with cinnamon immediately dissolves blood clots in arteries before doctors can intervene!",
    "Hidden camera footage proves aliens run the central banking system from an Antarctic geothermal base!",
    "Pouring hydrogen peroxide into the bloodstream revitalizes dying organs instantly and prevents cardiac arrest!",
    "Holding crystals near your phone screen absorbs 100 percent of harmful electromagnetic radiation!",
    "Drinking raw untreated ditch water immunizes your digestive tract from all bacteria forever!",
    "Secret military report admits cloud formations are artificial screens hiding incoming planet Nibiru!",
    "Eating ground eggshells with vinegar eliminates osteoporosis in 48 hours according to suppressed Soviet trials!",
    "Tap water contains synthetic memory molecules programmed by intelligence agencies to induce compliance!",
    "Applying turmeric and battery acid to skin removes malignant melanomas safely at home!",
    "Surgeons admit placing magnets on your temples eliminates the need for prescription blood thinners!",
    "Cell phone towers in residential neighborhoods cause instantaneous DNA denaturation in house pets!",
    "Drinking boiled dandelion sap replaces all chemotherapy drugs according to anonymous whistleblower doctors!",
    "They don't want you to know: Staring directly at the midday sun recharges your pineal battery naturally!"
]

def generate_and_save():
    data = []
    for text in CREDIBLE_SAMPLES:
        data.append({"text": text, "label": 0})
    for text in MISINFORMATION_SAMPLES:
        data.append({"text": text, "label": 1})
    
    df = pd.DataFrame(data)
    train_df, test_df = train_test_split(df, test_size=0.25, random_state=42, stratify=df["label"])
    
    dataset_dir = os.path.dirname(__file__)
    os.makedirs(dataset_dir, exist_ok=True)
    
    train_path = os.path.join(dataset_dir, "train_claims.csv")
    test_path = os.path.join(dataset_dir, "test_claims.csv")
    
    train_df.to_csv(train_path, index=False)
    test_df.to_csv(test_path, index=False)
    print(f"Generated dataset successfully: {len(train_df)} train samples, {len(test_df)} test samples.")

if __name__ == "__main__":
    generate_and_save()
