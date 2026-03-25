#ifndef VERIFIKASI_H
#define VERIFIKASI_H

#ifdef __EMSCRIPTEN__
#include <emscripten/bind.h>
#include <emscripten/emscripten.h>
#endif

#include <string>
#include <vector>

// #include <string>
// #include <vector>
// #include <emscripten/bind.h>
// #include <emscripten/val.h>
// #include <emscripten/emscripten.h>

using namespace emscripten;

// Status enum
enum class Status {
    MENUNGGU = 0,
    DITERIMA = 1,
    DITOLAK = 2
};

// Berkas Magang struct
struct BerkasMagang {
    std::string nama;
    std::string nim;
    std::string perusahaan;
    Status status;
    
    std::string statusToString() const;
    static Status stringToStatus(const std::string& s);
};

// Queue Node (Linked List)
struct QueueNode {
    BerkasMagang data;
    QueueNode* next;
    QueueNode(const BerkasMagang& d);
};

// Queue Class
class QueueLL {
private:
    QueueNode* frontPtr;
    QueueNode* rearPtr;
    
public:
    QueueLL();
    ~QueueLL();
    bool isEmpty() const;
    void enqueue(const BerkasMagang& x);
    bool dequeue(BerkasMagang& out);
    std::vector<BerkasMagang> getAll() const;
    void clear();
};

// Stack Node (Linked List)
struct StackNode {
    BerkasMagang data;
    StackNode* next;
    StackNode(const BerkasMagang& d);
};

// Stack Class
class StackLL {
private:
    StackNode* topPtr;
    
public:
    StackLL();
    ~StackLL();
    bool isEmpty() const;
    void push(const BerkasMagang& x);
    bool pop(BerkasMagang& out);
    bool peek(BerkasMagang& out) const;
    std::vector<BerkasMagang> getAll() const;
    void clear();
};

// Main Controller Class
class VerifikasiController {
private:
    QueueLL antrean;
    StackLL riwayat;
    
public:
    VerifikasiController();
    
    // API Methods
    std::string tambahBerkas(const std::string& nama, const std::string& nim, const std::string& perusahaan);
    std::string tampilkanAntrean();
    std::string prosesVerifikasi(const std::string& status);
    std::string tampilkanRiwayat();
    std::string tampilkanTerakhir();
    std::string cariBerkas(const std::string& keyword);
    std::string hapusAntrean();
    std::string resetRiwayat();
    
    // Get stats
    int getAntreanCount();
    int getRiwayatCount();
    int getDiterimaCount();
    int getDitolakCount();
};

// Helper functions untuk bindings
std::string statusToString(Status s);
Status stringToStatus(const std::string& s);

#endif