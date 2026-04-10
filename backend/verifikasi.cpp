// ==========================================
// SISTEM VERIFIKASI MAGANG
// menggunakan WebAssembly (Emscripten)
// ==========================================

#include <string>
#include <vector>
#include <sstream>
#include <algorithm>
#include <emscripten/bind.h>

using namespace emscripten;

enum class Status
{
    MENUNGGU = 0,
    DITERIMA = 1,
    DITOLAK = 2
};

struct BerkasMagang
{
    std::string nama;
    std::string nim;
    std::string perusahaan;
    Status status;

    std::string statusToString() const
    {
        switch (status)
        {
        case Status::MENUNGGU:
            return "MENUNGGU";
        case Status::DITERIMA:
            return "DITERIMA";
        case Status::DITOLAK:
            return "DITOLAK";
        }
        return "UNKNOWN";
    }

    static Status stringToStatus(const std::string &s)
    {
        if (s == "DITERIMA")
            return Status::DITERIMA;
        if (s == "DITOLAK")
            return Status::DITOLAK;
        return Status::MENUNGGU;
    }
};

// QUEUE NODE (LINKED LIST)
struct QueueNode
{
    BerkasMagang data;
    QueueNode *next;
    QueueNode(const BerkasMagang &d) : data(d), next(nullptr) {}
};

// QUEUE CLASS
class QueueLL
{
private:
    QueueNode *frontPtr;
    QueueNode *rearPtr;

public:
    QueueLL() : frontPtr(nullptr), rearPtr(nullptr) {}

    ~QueueLL()
    {
        clear();
    }

    bool isEmpty() const
    {
        return frontPtr == nullptr;
    }

    void enqueue(const BerkasMagang &x)
    {
        QueueNode *node = new QueueNode(x);
        if (isEmpty())
        {
            frontPtr = rearPtr = node;
        }
        else
        {
            rearPtr->next = node;
            rearPtr = node;
        }
    }

    bool dequeue(BerkasMagang &out)
    {
        if (isEmpty())
            return false;
        QueueNode *temp = frontPtr;
        out = temp->data;
        frontPtr = frontPtr->next;
        if (frontPtr == nullptr)
            rearPtr = nullptr;
        delete temp;
        return true;
    }

    std::vector<BerkasMagang> getAll() const
    {
        std::vector<BerkasMagang> result;
        QueueNode *cur = frontPtr;
        while (cur)
        {
            result.push_back(cur->data);
            cur = cur->next;
        }
        return result;
    }

    void clear()
    {
        BerkasMagang tmp;
        while (dequeue(tmp))
        {
        }
    }
};

// STACK NODE (LINKED LIST)
struct StackNode
{
    BerkasMagang data;
    StackNode *next;
    StackNode(const BerkasMagang &d) : data(d), next(nullptr) {}
};

// STACK CLASS
class StackLL
{
private:
    StackNode *topPtr;

public:
    StackLL() : topPtr(nullptr) {}

    ~StackLL()
    {
        clear();
    }

    bool isEmpty() const
    {
        return topPtr == nullptr;
    }

    void push(const BerkasMagang &x)
    {
        StackNode *node = new StackNode(x);
        node->next = topPtr;
        topPtr = node;
    }

    bool pop(BerkasMagang &out)
    {
        if (isEmpty())
            return false;
        StackNode *temp = topPtr;
        out = temp->data;
        topPtr = topPtr->next;
        delete temp;
        return true;
    }

    bool peek(BerkasMagang &out) const
    {
        if (isEmpty())
            return false;
        out = topPtr->data;
        return true;
    }

    std::vector<BerkasMagang> getAll() const
    {
        std::vector<BerkasMagang> result;
        StackNode *cur = topPtr;
        while (cur)
        {
            result.push_back(cur->data);
            cur = cur->next;
        }
        return result;
    }

    void clear()
    {
        BerkasMagang tmp;
        while (pop(tmp))
        {
        }
    }
};

// ==========================================
// MAIN CONTROLLER CLASS
// ==========================================

class VerifikasiController
{
private:
    QueueLL antrean;
    StackLL riwayat;

public:
    VerifikasiController() = default;

    // Tambah berkas ke antrean
    std::string tambahBerkas(const std::string &nama, const std::string &nim, const std::string &perusahaan)
    {
        BerkasMagang b;
        b.nama = nama;
        b.nim = nim;
        b.perusahaan = perusahaan;
        b.status = Status::MENUNGGU;

        antrean.enqueue(b);

        std::ostringstream oss;
        oss << "{\"success\":true,\"message\":\"Berkas berhasil ditambahkan\",\"data\":{";
        oss << "\"nama\":\"" << nama << "\",";
        oss << "\"nim\":\"" << nim << "\",";
        oss << "\"perusahaan\":\"" << perusahaan << "\",";
        oss << "\"status\":\"MENUNGGU\"}}";
        return oss.str();
    }

    // Lihat semua antrean
    std::string tampilkanAntrean()
    {
        auto daftar = antrean.getAll();
        std::ostringstream oss;
        oss << "{\"success\":true,\"data\":[";

        for (size_t i = 0; i < daftar.size(); i++)
        {
            if (i > 0)
                oss << ",";
            oss << "{";
            oss << "\"nama\":\"" << daftar[i].nama << "\",";
            oss << "\"nim\":\"" << daftar[i].nim << "\",";
            oss << "\"perusahaan\":\"" << daftar[i].perusahaan << "\",";
            oss << "\"status\":\"" << daftar[i].statusToString() << "\"";
            oss << "}";
        }

        oss << "],\"total\":" << daftar.size() << "}";
        return oss.str();
    }

    // Proses verifikasi
    std::string prosesVerifikasi(const std::string &statusStr)
    {
        BerkasMagang b;
        bool dequeued = antrean.dequeue(b);

        if (!dequeued)
        {
            return "{\"success\":false,\"message\":\"Antrean kosong\"}";
        }

        b.status = BerkasMagang::stringToStatus(statusStr);
        riwayat.push(b);

        std::ostringstream oss;
        oss << "{\"success\":true,\"message\":\"Verifikasi selesai\",\"data\":{";
        oss << "\"nama\":\"" << b.nama << "\",";
        oss << "\"nim\":\"" << b.nim << "\",";
        oss << "\"perusahaan\":\"" << b.perusahaan << "\",";
        oss << "\"status\":\"" << b.statusToString() << "\"}}";
        return oss.str();
    }

    // Lihat semua riwayat
    std::string tampilkanRiwayat()
    {
        auto daftar = riwayat.getAll();
        std::ostringstream oss;
        oss << "{\"success\":true,\"data\":[";

        for (size_t i = 0; i < daftar.size(); i++)
        {
            if (i > 0)
                oss << ",";
            oss << "{";
            oss << "\"nama\":\"" << daftar[i].nama << "\",";
            oss << "\"nim\":\"" << daftar[i].nim << "\",";
            oss << "\"perusahaan\":\"" << daftar[i].perusahaan << "\",";
            oss << "\"status\":\"" << daftar[i].statusToString() << "\"";
            oss << "}";
        }

        oss << "],\"total\":" << daftar.size() << "}";
        return oss.str();
    }

    // Lihat berkas terakhir diproses
    std::string tampilkanTerakhir()
    {
        BerkasMagang b;
        bool found = riwayat.peek(b);

        if (!found)
        {
            return "{\"success\":false,\"message\":\"Riwayat kosong\"}";
        }

        std::ostringstream oss;
        oss << "{\"success\":true,\"data\":{";
        oss << "\"nama\":\"" << b.nama << "\",";
        oss << "\"nim\":\"" << b.nim << "\",";
        oss << "\"perusahaan\":\"" << b.perusahaan << "\",";
        oss << "\"status\":\"" << b.statusToString() << "\"}}";
        return oss.str();
    }

    // Cari berkas (di antrean dan riwayat)
    std::string cariBerkas(const std::string &keyword)
    {
        std::vector<BerkasMagang> hasil;

        auto cari = [&keyword](const BerkasMagang &b)
        {
            return b.nama.find(keyword) != std::string::npos ||
                   b.nim.find(keyword) != std::string::npos ||
                   b.perusahaan.find(keyword) != std::string::npos;
        };

        auto antreanList = antrean.getAll();
        auto riwayatList = riwayat.getAll();

        std::copy_if(antreanList.begin(), antreanList.end(), std::back_inserter(hasil), cari);
        std::copy_if(riwayatList.begin(), riwayatList.end(), std::back_inserter(hasil), cari);

        std::ostringstream oss;
        oss << "{\"success\":true,\"data\":[";

        for (size_t i = 0; i < hasil.size(); i++)
        {
            if (i > 0)
                oss << ",";
            oss << "{";
            oss << "\"nama\":\"" << hasil[i].nama << "\",";
            oss << "\"nim\":\"" << hasil[i].nim << "\",";
            oss << "\"perusahaan\":\"" << hasil[i].perusahaan << "\",";
            oss << "\"status\":\"" << hasil[i].statusToString() << "\"";
            oss << "}";
        }

        oss << "],\"keyword\":\"" << keyword << "\",\"total\":" << hasil.size() << "}";
        return oss.str();
    }

    // Hapus semua antrean
    std::string hapusAntrean()
    {
        antrean.clear();
        return "{\"success\":true,\"message\":\"Semua antrean berhasil dihapus\"}";
    }

    // Reset semua riwayat
    std::string resetRiwayat()
    {
        riwayat.clear();
        return "{\"success\":true,\"message\":\"Riwayat berhasil direset\"}";
    }

    // Get jumlah antrean
    int getAntreanCount()
    {
        return antrean.getAll().size();
    }

    // Get jumlah riwayat
    int getRiwayatCount()
    {
        return riwayat.getAll().size();
    }

    // Get jumlah diterima
    int getDiterimaCount()
    {
        auto daftar = riwayat.getAll();
        int count = 0;
        for (const auto &b : daftar)
        {
            if (b.status == Status::DITERIMA)
                count++;
        }
        return count;
    }

    // Get jumlah ditolak
    int getDitolakCount()
    {
        auto daftar = riwayat.getAll();
        int count = 0;
        for (const auto &b : daftar)
        {
            if (b.status == Status::DITOLAK)
                count++;
        }
        return count;
    }
};

// EMSCRIPTEN BINDINGS (buat WASM)
EMSCRIPTEN_BINDINGS(verifikasi_module)
{
    class_<VerifikasiController>("VerifikasiController")
        .constructor<>()
        .function("tambahBerkas", &VerifikasiController::tambahBerkas)
        .function("tampilkanAntrean", &VerifikasiController::tampilkanAntrean)
        .function("prosesVerifikasi", &VerifikasiController::prosesVerifikasi)
        .function("tampilkanRiwayat", &VerifikasiController::tampilkanRiwayat)
        .function("tampilkanTerakhir", &VerifikasiController::tampilkanTerakhir)
        .function("cariBerkas", &VerifikasiController::cariBerkas)
        .function("hapusAntrean", &VerifikasiController::hapusAntrean)
        .function("resetRiwayat", &VerifikasiController::resetRiwayat)
        .function("getAntreanCount", &VerifikasiController::getAntreanCount)
        .function("getRiwayatCount", &VerifikasiController::getRiwayatCount)
        .function("getDiterimaCount", &VerifikasiController::getDiterimaCount)
        .function("getDitolakCount", &VerifikasiController::getDitolakCount);
}