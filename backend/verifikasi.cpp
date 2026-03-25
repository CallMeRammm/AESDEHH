#include "verifikasi.h"
#include <sstream>
#include <algorithm>
#include <emscripten/bind.h>

using namespace emscripten;

// ==================== BERKAS MAGANG ====================
std::string BerkasMagang::statusToString() const {
    switch (status) {
        case Status::MENUNGGU: return "MENUNGGU";
        case Status::DITERIMA: return "DITERIMA";
        case Status::DITOLAK: return "DITOLAK";
    }
    return "UNKNOWN";
}

Status BerkasMagang::stringToStatus(const std::string& s) {
    if (s == "DITERIMA") return Status::DITERIMA;
    if (s == "DITOLAK") return Status::DITOLAK;
    return Status::MENUNGGU;
}

// ==================== QUEUE NODE ====================
QueueNode::QueueNode(const BerkasMagang& d) : data(d), next(nullptr) {}

// ==================== QUEUE ====================
QueueLL::QueueLL() : frontPtr(nullptr), rearPtr(nullptr) {}

QueueLL::~QueueLL() {
    clear();
}

bool QueueLL::isEmpty() const {
    return frontPtr == nullptr;
}

void QueueLL::enqueue(const BerkasMagang& x) {
    QueueNode* node = new QueueNode(x);
    if (isEmpty()) {
        frontPtr = rearPtr = node;
    } else {
        rearPtr->next = node;
        rearPtr = node;
    }
}

bool QueueLL::dequeue(BerkasMagang& out) {
    if (isEmpty()) return false;
    QueueNode* temp = frontPtr;
    out = temp->data;
    frontPtr = frontPtr->next;
    if (frontPtr == nullptr) rearPtr = nullptr;
    delete temp;
    return true;
}

std::vector<BerkasMagang> QueueLL::getAll() const {
    std::vector<BerkasMagang> result;
    QueueNode* cur = frontPtr;
    while (cur) {
        result.push_back(cur->data);
        cur = cur->next;
    }
    return result;
}

void QueueLL::clear() {
    BerkasMagang tmp;
    while (dequeue(tmp)) {}
}

// ==================== STACK NODE ====================
StackNode::StackNode(const BerkasMagang& d) : data(d), next(nullptr) {}

// ==================== STACK ====================
StackLL::StackLL() : topPtr(nullptr) {}

StackLL::~StackLL() {
    clear();
}

bool StackLL::isEmpty() const {
    return topPtr == nullptr;
}

void StackLL::push(const BerkasMagang& x) {
    StackNode* node = new StackNode(x);
    node->next = topPtr;
    topPtr = node;
}

bool StackLL::pop(BerkasMagang& out) {
    if (isEmpty()) return false;
    StackNode* temp = topPtr;
    out = temp->data;
    topPtr = topPtr->next;
    delete temp;
    return true;
}

bool StackLL::peek(BerkasMagang& out) const {
    if (isEmpty()) return false;
    out = topPtr->data;
    return true;
}

std::vector<BerkasMagang> StackLL::getAll() const {
    std::vector<BerkasMagang> result;
    StackNode* cur = topPtr;
    while (cur) {
        result.push_back(cur->data);
        cur = cur->next;
    }
    return result;
}

void StackLL::clear() {
    BerkasMagang tmp;
    while (pop(tmp)) {}
}

// ==================== CONTROLLER ====================
VerifikasiController::VerifikasiController() {}

std::string VerifikasiController::tambahBerkas(const std::string& nama, 
                                                const std::string& nim, 
                                                const std::string& perusahaan) {
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

std::string VerifikasiController::tampilkanAntrean() {
    auto daftar = antrean.getAll();
    std::ostringstream oss;
    oss << "{\"success\":true,\"data\":[";
    
    for (size_t i = 0; i < daftar.size(); i++) {
        if (i > 0) oss << ",";
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

std::string VerifikasiController::prosesVerifikasi(const std::string& statusStr) {
    BerkasMagang b;
    bool dequeued = antrean.dequeue(b);
    
    if (!dequeued) {
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

std::string VerifikasiController::tampilkanRiwayat() {
    auto daftar = riwayat.getAll();
    std::ostringstream oss;
    oss << "{\"success\":true,\"data\":[";
    
    for (size_t i = 0; i < daftar.size(); i++) {
        if (i > 0) oss << ",";
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

std::string VerifikasiController::tampilkanTerakhir() {
    BerkasMagang b;
    bool found = riwayat.peek(b);
    
    if (!found) {
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

std::string VerifikasiController::cariBerkas(const std::string& keyword) {
    std::vector<BerkasMagang> hasil;
    
    auto cari = [&keyword](const BerkasMagang& b) {
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
    
    for (size_t i = 0; i < hasil.size(); i++) {
        if (i > 0) oss << ",";
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

std::string VerifikasiController::hapusAntrean() {
    antrean.clear();
    return "{\"success\":true,\"message\":\"Semua antrean berhasil dihapus\"}";
}

std::string VerifikasiController::resetRiwayat() {
    riwayat.clear();
    return "{\"success\":true,\"message\":\"Riwayat berhasil direset\"}";
}

int VerifikasiController::getAntreanCount() {
    return antrean.getAll().size();
}

int VerifikasiController::getRiwayatCount() {
    return riwayat.getAll().size();
}

int VerifikasiController::getDiterimaCount() {
    auto daftar = riwayat.getAll();
    int count = 0;
    for (const auto& b : daftar) {
        if (b.status == Status::DITERIMA) count++;
    }
    return count;
}

int VerifikasiController::getDitolakCount() {
    auto daftar = riwayat.getAll();
    int count = 0;
    for (const auto& b : daftar) {
        if (b.status == Status::DITOLAK) count++;
    }
    return count;
}

// ==================== BINDINGS ====================
EMSCRIPTEN_BINDINGS(verifikasi_module) {
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