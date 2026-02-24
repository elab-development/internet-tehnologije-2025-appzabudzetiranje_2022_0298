# 💸 FinSave — Full-stack React / Laravel / MySQL aplikacija

**FinSave** je lična aplikacija za praćenje troškova, deljenje računa i praćenje/refundiranje dugova.
Sastoji se od **REST API-ja (Laravel + MySQL)** i **SPA frontenda (React + MUI)** sa jasno
definisanim ulogama (**regular** i **admin**) i zaštitom preko **Laravel Sanctum** tokena.

---

## 🚀 Tehnologije

- **Backend:** Laravel 10+, PHP 8.x, MySQL 8, Laravel Sanctum (PAT), Laravel CORS
- **Frontend:** React (CRA/Vite), Material UI (MUI 5), Axios, React Router, Recharts
- **Dodatno:** CSV export (admin), komponentni *Slider*, moderni UI (glass/gradients)
- **Pokretanje:** `php artisan serve` (API) i `npm start` (React)

---

## 👥 Uloge i dozvole

### 1) Gost (nelogovan)
- ✅ Registracija i prijava
- ❌ Nema pristup aplikaciji (nav/stranice) pre logovanja

### 2) Regular korisnik (`role = regular`)
- ✅ Kreiranje i pregled **troškova** (expenses)
- ✅ Dodavanje/brisanje **učesnika troška** (participants)  
  + ograničenje: zbir individualnih iznosa ≤ iznos troška
- ✅ Kreiranje i pregled **refundacija** (settlements) – ko kome duguje
- ✅ **Statistika ušteda** (suma plaćeno / suma dugovanja / bilans) + linijski graf (Recharts)
- ❌ Nema administratorske funkcije

### 3) Administrator (`role = admin`)
- ✅ Sve privilegije regular korisnika
- ✅ **Admin Dashboard** (istaknuta uloga + brzi linkovi)
- ✅ **Upravljanje korisnicima** (listanje, pretraga, sortiranje, ažuriranje, brisanje)
- ✅ **CSV export korisnika** (`/api/users/export`)


## 🔌 API rute (sažetak)

> Sve zaštićene rute koriste **Sanctum Bearer token**:  
> `Authorization: Bearer {token}`

### Autentikacija
| Metod | Ruta           | Opis               |
|------:|----------------|--------------------|
| POST  | `/api/register`| Registracija       |
| POST  | `/api/login`   | Prijava (dobija se token) |
| POST  | `/api/logout`  | Odjava (inval. tokena)    |

### Korisnici (admin-only za update/destroy; index/show dostupni svim ulogama)
| Metod | Ruta                 | Opis |
|------:|----------------------|------|
| GET   | `/api/users`         | Lista (paginacija, `?search=`, `?per_page=`; `?all=1` vraća sve) |
| GET   | `/api/users/{id}`    | Detalji korisnika |
| PUT   | `/api/users/{id}`    | **Admin** update (name/email/role/password) |
| DELETE| `/api/users/{id}`    | **Admin** brisanje |
| GET   | `/api/users/export`  | **Admin** CSV export korisnika |

### Kategorije
| Metod | Ruta                        | Opis |
|------:|-----------------------------|------|
| GET   | `/api/categories`          | Lista |
| POST  | `/api/categories`          | **Admin** kreiranje |
| PUT   | `/api/categories/{id}`     | **Admin** izmena |
| DELETE| `/api/categories/{id}`     | **Admin** brisanje |

### Troškovi
| Metod | Ruta                             | Opis |
|------:|----------------------------------|------|
| GET   | `/api/expenses`                  | Lista troškova (sa kategorijom i platiocem) |
| POST  | `/api/expenses`                  | Kreiranje troška |
| PATCH | `/api/expenses/{id}/update`      | Izmena troška |
| DELETE| `/api/expenses/{id}/delete`      | Brisanje troška |

### Učesnici troška
| Metod | Ruta                                   | Opis |
|------:|----------------------------------------|------|
| GET   | `/api/expense-participants`            | Lista svih učesnika (sa `expense` i `user`) |
| POST  | `/api/expense-participants`            | Dodaj učesnika (validacija sume ≤ iznos troška) |
| DELETE| `/api/expense-participants/{id}`        | Ukloni učesnika |

### Refundacije (settlements)
| Metod | Ruta                    | Opis |
|------:|-------------------------|------|
| GET   | `/api/settlements`      | Lista vaših transakcija (poslate/primljene) |
| POST  | `/api/settlements`      | Kreiranje (from = ulogovani korisnik) |
| PUT   | `/api/settlements/{id}` | Izmena (dozvoljena samo autoru) |

### Statistika
| Metod | Ruta              | Opis |
|------:|-------------------|------|
| GET   | `/api/stats/savings` | `paid_total`, `owed_total`, `balance` (samo **regular**) |

---

## 🖥️ Frontend – ključne stranice

- `Home.jsx` — uvod (za regular korisnike)
- `AboutUs.jsx` — statična stranica o aplikaciji
- `Expenses.jsx` — lista troškova + dodavanje/izmena/brisanje  
  + dodavanje učesnika (MUI `Autocomplete` prikazuje **samo korisnike koji nisu već učesnici**)
  + dugme za dodavanje onemogućeno kada zbir učesnika ≥ iznos troška
  + učesnici se mogu uklanjati
- `Settlements.jsx` — kreiranje i pregled refundacija (jasno označeno *you sent* / *you received*, neto)
- `Statistics.jsx` — **Savings analytics** + **AreaChart (Recharts)** po mesecima
- `AdminDashboard.jsx` — slider + istaknuta uloga administratora, brzi linkovi
- `UserManagement.jsx` — admin tabela korisnika (pretraga, **sort po imenu ASC/DESC**, izmena, brisanje, CSV export)
- `Nav.jsx` — dinamički meni:
  - **regular**: Home / About / Expenses / Settlements / Statistics
  - **admin**: **Admin Dashboard / Users**
- `Auth.jsx` — prijava/registracija (role=admin vodi na `/admin`, ostali na `/home`)
- `Footer.jsx` — podnožje
- `components/Slider.jsx` — jednostavan slideshow (hero)

---

## ⚙️ Setup (lokalni razvoj)

---------------------------

1. Klonirajte repozitorijum:
```bash
    git clone https://github.com/elab-development/internet-tehnologije-2024-projekat-finsave_2019_0355.git
```
2. Pokrenite backend:
```bash
   cd finsave-api
   composer install
   php artisan migrate:fresh --seed
   php artisan serve
```
    
3. Pokrenite frontend:
```bash
   cd finsave-gui
   npm install
   npm start
```
    

4.  Frontend pokrenut na: [http://localhost:3000](http://localhost:3000) Backend API pokrenut na: [http://127.0.0.1:8000/api](http://127.0.0.1:8000/api)
