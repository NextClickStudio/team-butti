# card colour per product: brand palette, never the garment's own colour, never the same as the previous card
import importlib.util, json, sys
spec = importlib.util.spec_from_file_location('d', sys.argv[1]); d = importlib.util.module_from_spec(spec); spec.loader.exec_module(d)
PAL = {'Y': 'ffd400', 'P': 'ff2e93', 'G': '39ff14', 'B': '1d3fbf', 'T': 'e0a54a', 'K': '0d0d0d'}
OK = {'PAN': 'BPKG', 'VMI': 'YPT', 'BNA': 'YPGT', 'FUX': 'YGB', 'BIO': 'BPKG', 'NER': 'YPGB', 'GIA': 'BPK', 'VBO': 'YPT',
      'PFR': 'BGK', 'VFR': 'YB', 'NBI': 'PYG', 'BLT': 'YPG', 'ROS': 'GYBK', 'DCB': 'BPK', 'TCA': 'YP'}
order, prev, out, i = 'YPGBTK', None, [], 0
for t, code, col, k, stock, imgs in d.P:
    if not imgs: continue
    allowed = [c for c in order if c in OK[col] and c != prev]
    c = allowed[i % len(allowed)]; i += 1; prev = c
    out.append({'title': t, 'handle': d.handle(t), 'bg': PAL[c], 'imgs': imgs})
json.dump(out, open(sys.argv[2], 'w'), indent=1); print(len(out))
