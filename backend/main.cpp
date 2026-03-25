#include "verifikasi.h"
#include <iostream>
#include <string>

using namespace std;

int main() {
    cout << "========================================" << endl;
    cout << "Testing Verifikasi Magang System" << endl;
    cout << "========================================" << endl;
    
    VerifikasiController controller;
    
    // Test tambah berkas
    cout << "\n1. Menambahkan berkas..." << endl;
    cout << controller.tambahBerkas("Budi Santoso", "2101234567", "PT Teknologi Nusantara") << endl;
    cout << controller.tambahBerkas("Ani Wijaya", "2101234568", "PT Maju Bersama") << endl;
    cout << controller.tambahBerkas("Citra Dewi", "2101234569", "PT Inovasi Digital") << endl;
    
    // Test lihat antrean
    cout << "\n2. Melihat antrean..." << endl;
    cout << controller.tampilkanAntrean() << endl;
    
    // Test proses verifikasi
    cout << "\n3. Proses verifikasi (DITERIMA)..." << endl;
    cout << controller.prosesVerifikasi("DITERIMA") << endl;
    
    // Test lihat antrean setelah verifikasi
    cout << "\n4. Melihat antrean setelah verifikasi..." << endl;
    cout << controller.tampilkanAntrean() << endl;
    
    // Test lihat riwayat
    cout << "\n5. Melihat riwayat..." << endl;
    cout << controller.tampilkanRiwayat() << endl;
    
    // Test lihat terakhir
    cout << "\n6. Melihat berkas terakhir diproses..." << endl;
    cout << controller.tampilkanTerakhir() << endl;
    
    // Test statistik
    cout << "\n7. Statistik..." << endl;
    cout << "Antrean count: " << controller.getAntreanCount() << endl;
    cout << "Riwayat count: " << controller.getRiwayatCount() << endl;
    cout << "Diterima: " << controller.getDiterimaCount() << endl;
    cout << "Ditolak: " << controller.getDitolakCount() << endl;
    
    // Test cari berkas
    cout << "\n8. Mencari berkas dengan keyword 'Budi'..." << endl;
    cout << controller.cariBerkas("Budi") << endl;
    
    // Test reset
    cout << "\n9. Reset antrean..." << endl;
    cout << controller.hapusAntrean() << endl;
    
    cout << "\n========================================" << endl;
    cout << "Testing selesai!" << endl;
    cout << "========================================" << endl;
    
    return 0;
}