// Deadline configuration - you can modify this date
const DEADLINE = new Date('2025-06-30T23:59:59'); // June 30, 2025

function checkDeadline() {
    const now = new Date();
    if (now > DEADLINE) {
        // Hide the form and show deadline message
        document.getElementById('main').style.display = 'none';
        document.body.innerHTML = `
            <div class="container">
                <div class="box">
                    <div class="card">
                        <div class="text-center">
                            <h2 style="color: red;">Pengumuman Telah Berakhir</h2>
                            <p>Masa pengumuman SNBT SNPMB 2025 telah berakhir pada tanggal ${DEADLINE.toLocaleDateString('id-ID')}.</p>
                            <p>Silakan hubungi panitia untuk informasi lebih lanjut.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        return false;
    }
    return true;
}

// Check deadline on page load
document.addEventListener('DOMContentLoaded', function() {
    checkDeadline();
});