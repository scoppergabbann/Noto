# Konvensi Kontribusi

## Commit — Conventional Commits
Format: `<type>(scope opsional): deskripsi singkat`

Tipe yang dipakai:
- `feat:` fitur baru
- `fix:` perbaikan bug
- `docs:` dokumentasi
- `style:` formatting (tidak ubah logika)
- `refactor:` refactor tanpa ubah perilaku
- `perf:` peningkatan performa
- `test:` menambah/memperbaiki test
- `chore:` tooling, dependency, dll
- `ci:` konfigurasi CI/CD

Contoh:
```
feat(cash): tambah form target tabungan baru
fix(cards): perbaiki perhitungan utilisasi
chore: setup prettier & eslint
```

## Sebelum commit
```bash
npm run lint        # cek lint
npm run format      # rapikan format dengan Prettier
```
