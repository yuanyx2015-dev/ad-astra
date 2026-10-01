# Asset Structure

Visual assets should follow this organization:

```text
public/assets/
├── shared/
│   └── cras/
│       ├── neutral.png
│       ├── amused.png
│       ├── concerned.png
│       └── annoyed.png
├── habitat/
│   └── base.png
├── systems/
│   ├── water_off.png
│   ├── water_on.png
│   ├── power_off.png
│   ├── power_on.png
│   ├── comms_off.png
│   └── comms_on.png
└── rooms/
    ├── main_habitat.png
    ├── communications.png
    └── greenhouse.png
```

## Rules

1. Reusable character assets go under `public/assets/shared/`.
2. Habitat-specific assets go under `public/assets/habitat/`.
3. System state assets use paired naming such as `*_off.png` and `*_on.png`.
4. Future chapter assets should extend this structure instead of creating new ad-hoc folders.
5. Keep filenames lowercase with underscores.
6. Do not rename or move current assets yet unless required by a later dedicated migration task.
7. Do not change game code when performing asset-organization documentation work.
