#include <iostream>
#include <string>
#include <limits>
using namespace std;

// -----------------------------
// Model Data
// -----------------------------
enum class Status {
    MENUNGGU = 0,
    DITERIMA  = 1,
    DITOLAK   = 2
};

struct BerkasMagang {
    string nama;
    string nim;
    string perusahaan;
    Status status = Status::MENUNGGU;
};

static string statusToString(Status s) {
    switch (s) {
        case Status::MENUNGGU: return "MENUNGGU";
        case Status::DITERIMA : return "DITERIMA";
        case Status::DITOLAK  : return "DITOLAK";
    }
    return "-";
}

static void printBerkas(const BerkasMagang& b, int idx = -1) {
    if (idx >= 0) cout << idx << ". ";
    cout << "Nama: " << b.nama
         << " | NIM: " << b.nim
         << " | Perusahaan: " << b.perusahaan
         << " | Status: " << statusToString(b.status)
         << "\n";
}

// -----------------------------
// Queue (Linked List)
// -----------------------------
class QueueLL {
private:
    struct Node {
        BerkasMagang data;
        Node* next;
        Node(const BerkasMagang& d): data(d), next(nullptr) {}
    };
    Node* frontPtr;
    Node* rearPtr;

public:
    QueueLL(): frontPtr(nullptr), rearPtr(nullptr) {}
    ~QueueLL() {
        BerkasMagang tmp; 
        while (dequeue(tmp)) {}
    }

    bool isEmpty() const { return frontPtr == nullptr; }

    void enqueue(const BerkasMagang& x) {
        Node* node = new Node(x);
        if (isEmpty()) {
            frontPtr = rearPtr = node;
        } else {
            rearPtr->next = node;
            rearPtr = node;
        }
    }

    bool dequeue(BerkasMagang& out) {
        if (isEmpty()) return false;
        Node* temp = frontPtr;
        out = temp->data;
        frontPtr = frontPtr->next;
        if (frontPtr == nullptr) rearPtr = nullptr;
        delete temp;
        return true;
    }

    bool peek(BerkasMagang& out) const {
        if (isEmpty()) return false;
        out = frontPtr->data;
        return true;
    }

    void display() const {
        if (isEmpty()) {
            cout << "(Antrean kosong)\n";
            return;
        }
        const Node* cur = frontPtr;
        int i = 1;
        while (cur) {
            printBerkas(cur->data, i++);
            cur = cur->next;
        }
    }
};

// -----------------------------
// Stack (Linked List)
// -----------------------------
class StackLL {
private:
    struct Node {
        BerkasMagang data;
        Node* next;
        Node(const BerkasMagang& d): data(d), next(nullptr) {}
    };
    Node* topPtr;

public:
    StackLL(): topPtr(nullptr) {}
    ~StackLL() {
        BerkasMagang tmp;
        while (pop(tmp)) {}
    }

    bool isEmpty() const { return topPtr == nullptr; }

    void push(const BerkasMagang& x) {
        Node* node = new Node(x);
        node->next = topPtr;
        topPtr = node;
    }

    bool pop(BerkasMagang& out) {
        if (isEmpty()) return false;
        Node* temp = topPtr;
        out = temp->data;
        topPtr = topPtr->next;
        delete temp;
        return true;
    }

    bool peek(BerkasMagang& out) const {
        if (isEmpty()) return false;
        out = topPtr->data;
        return true;
    }

    void display() const {
        if (isEmpty()) {
            cout << "(Riwayat kosong)\n";
            return;
        }
        const Node* cur = topPtr;
        int i = 1;
        while (cur) {
            printBerkas(cur->data, i++);
            cur = cur->next;
        }
    }
};

// -----------------------------
// Utility Input
// -----------------------------
static void clearInput() {
    cin.clear();
    cin.ignore(numeric_limits<streamsize>::max(), '\n');
}

// -----------------------------
// Operasi Menu
// -----------------------------
static void tambahBerkas(QueueLL& antrean) {
    cout << "\n=== Tambah Berkas ke Antrean ===\n";
    string nama, nim, perusahaan;

    cout << "Nama Mahasiswa   : ";
    getline(cin, nama);
    cout << "NIM              : ";
    getline(cin, nim);
    cout << "Perusahaan Tujuan: ";
    getline(cin, perusahaan);

    BerkasMagang b { nama, nim, perusahaan, Status::MENUNGGU };
    antrean.enqueue(b);
    cout << "Berkas berhasil ditambahkan ke antrean.\n";
}

static void prosesVerifikasi(QueueLL& antrean, StackLL& riwayat) {
    cout << "\n=== Proses Verifikasi Berikutnya ===\n";
    BerkasMagang b;
    if (!antrean.dequeue(b)) {
        cout << "Antrean kosong. Tidak ada berkas untuk diverifikasi.\n";
        return;
    }

    cout << "Memverifikasi berkas:\n";
    printBerkas(b);

    cout << "Hasil verifikasi (A = Diterima, T = Ditolak): ";
    char c;
    if (!(cin >> c)) {
        clearInput();
        cout << "Input tidak valid.\n";
        return;
    }
    clearInput();

    if (c == 'A' || c == 'a') {
        b.status = Status::DITERIMA;
    } else {
        b.status = Status::DITOLAK;
    }

    riwayat.push(b);
    cout << "Hasil verifikasi disimpan ke riwayat.\n";
}

static void tampilkanAntrean(QueueLL& antrean) {
    cout << "\n=== Antrean Verifikasi ===\n";
    antrean.display();
}

static void tampilkanRiwayat(StackLL& riwayat) {
    cout << "\n=== Riwayat Verifikasi (Top = terakhir diproses) ===\n";
    riwayat.display();
}

static void tampilkanTerakhirDiproses(StackLL& riwayat) {
    cout << "\n=== Berkas Terakhir Diproses ===\n";
    BerkasMagang b;
    if (!riwayat.peek(b)) {
        cout << "Riwayat kosong.\n";
        return;
    }
    printBerkas(b);
}

// -----------------------------
// Main (Menu-driven)
// -----------------------------
int main() {
    ios::sync_with_stdio(true);
    cin.tie(nullptr);

    QueueLL antrean;
    StackLL riwayat;

    while (true) {
        cout << "\n==============================\n";
        cout << " Sistem Antrean Verifikasi\n";
        cout << "==============================\n";
        cout << "1. Tambah berkas ke antrean\n";
        cout << "2. Proses verifikasi berikutnya\n";
        cout << "3. Tampilkan berkas terakhir diproses\n";
        cout << "4. Tampilkan antrean verifikasi\n";
        cout << "5. Tampilkan riwayat verifikasi\n";
        cout << "6. Keluar\n";
        cout << "Pilih menu [1-6]: ";

        int menu;
        if (!(cin >> menu)) {
            clearInput();
            cout << "Input tidak valid. Coba lagi.\n";
            continue;
        }
        clearInput();

        switch (menu) {
            case 1: tambahBerkas(antrean); break;
            case 2: prosesVerifikasi(antrean, riwayat); break;
            case 3: tampilkanTerakhirDiproses(riwayat); break;
            case 4: tampilkanAntrean(antrean); break;
            case 5: tampilkanRiwayat(riwayat); break;
            case 6: cout << "Terima kasih. Keluar.\n"; return 0;
            default: cout << "Menu tidak dikenal.\n"; break;
        }
    }
}
