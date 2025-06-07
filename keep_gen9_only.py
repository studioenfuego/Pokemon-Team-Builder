import os

# Official Gen 9 Pokémon names (English, National Dex order, uppercase, no forms/variants)
gen9_names = [
    'SPRIGATITO', 'FLORAGATO', 'MEOWSCARADA',
    'FUECOCO', 'CROCALOR', 'SKELEDIRGE',
    'QUAXLY', 'QUAXWELL', 'QUAQUAVAL',
    'LECHONK', 'OINKOLOGNE',
    'TAROUNTULA', 'SPIDOPS',
    'NYMBLE', 'LOKIX',
    'PAWMI', 'PAWMO', 'PAWMOT',
    'TANDEMAUS', 'MAUSHOLD',
    'FIDOUGH', 'DACHSBUN',
    'SMOLIV', 'DOLLIV', 'ARBOLIVA',
    'SQUAWKABILLY',
    'NACLI', 'NACLSTACK', 'GARGANACL',
    'CHARCADET', 'ARMAROUGE', 'CERULEDGE',
    'TADBULB', 'BELLIBOLT',
    'WATTREL', 'KILOWATTREL',
    'MASCHIFF', 'MABOSSTIFF',
    'SHROODLE', 'GRAFAIAI',
    'BRAMBLIN', 'BRAMBLEGHAST',
    'TOEDSCOOL', 'TOEDSCRUEL',
    'KLAWF',
    'CAPSAKID', 'SCOVILAIN',
    'RELLOR', 'RABSCA',
    'FLITTLE', 'ESPATHRA',
    'TINKATINK', 'TINKATUFF', 'TINKATON',
    'WIGLETT', 'WUGTRIO',
    'BOMBIRDIER',
    'FINIZEN', 'PALAFIN',
    'VAROOM', 'REVAVROOM',
    'CYCLIZAR',
    'ORTHWORM',
    'GLIMMET', 'GLIMMORA',
    'GREAVARD', 'HOUNDSTONE',
    'FLAMIGO',
    'CETODDLE', 'CETITAN',
    'VELUZA',
    'DONDOZO',
    'TATSUGIRI',
    'ANNIHILAPE',
    'CLODSIRE',
    'FARIGIRAF',
    'DUDUNSPARCE',
    'KINGAMBIT',
    'GREATTUSK', 'SCREAMTAIL', 'BRUTEBONNET', 'FLUTTERMANE', 'SLITHERWING', 'SANDYSHOCKS', 'IRONTHREADS', 'IRONMOTH', 'IRONHANDS', 'IRONJUGULIS', 'IRONTHORNS', 'IRONBUNDLE', 'IRONVALIANT', 'TINGLU', 'CHIENPAO', 'WOCHIEN', 'CHIYU', 'ROARINGMOON', 'IRONLEAVES', 'WALKINGWAKE', 'KORAIDON', 'MIRAIDON', 'TINKATON', 'OKIDOGI', 'MUNKIDORI', 'FEZANDIPITI', 'OGERPON', 'ARCHALUDON', 'HYDRAPPLE', 'GOUGINGFIRE', 'RAGINGBOLT', 'IRONBOULDER', 'IRONCROWN', 'TERAPAGOS', 'PECHARUNT'
]

folder = 'Front'
folder_path = os.path.join(os.path.dirname(__file__), folder)

# Gather all .png files in the folder
all_files = [f for f in os.listdir(folder_path) if f.lower().endswith('.png')]

# Normalize function to handle uppercase and remove suffixes (e.g., _1, _female, etc.)
def normalize(name):
    base = name.upper().split('_')[0]
    return base

# Prepare sets for comparison
keep_set = set(gen9_names)
keep_files = []
delete_files = []

for file in all_files:
    base = os.path.splitext(file)[0]
    norm = normalize(base)
    if norm in keep_set:
        keep_files.append(file)
    else:
        delete_files.append(file)

print(f"Will keep {len(keep_files)} files:")
for f in keep_files:
    print(f"  KEEP: {f}")
print(f"Will delete {len(delete_files)} files:")
for f in delete_files:
    print(f"  DELETE: {f}")

# Uncomment below to actually delete files
for f in delete_files:
    os.remove(os.path.join(folder_path, f))

print("\nReview the above. If correct, uncomment the deletion lines to proceed.")
