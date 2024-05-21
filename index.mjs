import fs from 'fs';
import fetch from 'node-fetch';

// Function to make fetch requests with a timeout
const fetchWithTimeout = (url, options, timeout = 10000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), timeout))
  ]);
};

const tembak = (token) => {
  return new Promise((resolve, reject) => {
    const randomtap = Math.floor(Math.random() * 50) + 50;
    fetchWithTimeout('https://api.tapswap.ai/api/player/submit_taps', {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 11; Galaxy S7 Build/RQ1A.210105.003; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.120 Mobile Safari/537.36',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
        'x-app': 'tapswap_server',
        'Content-Id': '27904',
        'x-cv': '1',
        Origin: 'https://app.tapswap.club',
        'X-Requested-With': 'org.telegram.messenger',
        'Sec-Fetch-Site': 'cross-site',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Dest': 'empty',
        Referer: 'https://app.tapswap.club/',
        'Accept-Language': 'en,en-US;q=0.9',
      },
      body: JSON.stringify({
        taps: randomtap,
        time: new Date().getTime() - 10000,
      }),
    })
      .then(response => response.json())
      .then(data => resolve(data))
      .catch(error => reject(error));
  });
};

const login = (hash) => {
  return new Promise((resolve, reject) => {
    fetchWithTimeout('https://api.tapswap.ai/api/account/login', {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 11; Galaxy S7 Build/RQ1A.210105.003; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.120 Mobile Safari/537.36',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
        'x-app': 'tapswap_server',
        'x-cv': '1',
        Origin: 'https://app.tapswap.club',
        'X-Requested-With': 'org.telegram.messenger',
        'Sec-Fetch-Site': 'cross-site',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Dest': 'empty',
        Referer: 'https://app.tapswap.club/',
        'Accept-Language': 'en,en-US;q=0.9',
      },
      body: JSON.stringify({
        init_data: hash,
        referrer: '',
        bot_key: 'app_bot_0',
      }),
    })
      .then(response => response.json())
      .then(data => resolve(data))
      .catch(error => reject(error));
  });
};

const applyboost = (token) => {
  return new Promise((resolve, reject) => {
    fetchWithTimeout('https://api.tapswap.ai/api/player/apply_boost', {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 11; Galaxy S7 Build/RQ1A.210105.003; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.120 Mobile Safari/537.36',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
        'x-app': 'tapswap_server',
        'x-cv': '1',
        Origin: 'https://app.tapswap.club',
        'X-Requested-With': 'org.telegram.messenger',
        'Sec-Fetch-Site': 'cross-site',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Dest': 'empty',
        Referer: 'https://app.tapswap.club/',
        'Accept-Language': 'en,en-US;q=0.9',
      },
      body: JSON.stringify({
        type: 'energy',
      }),
    })
      .then(response => response.json())
      .then(data => resolve(data))
      .catch(error => reject(error));
  });
};

const main = async () => {
  while (true) {
    console.clear();
    const hashlist = fs.readFileSync('hash.txt', 'utf8').trim().split('\n');
    console.log(`[ ${new Date().toLocaleString()} ] Total akun yang akan dijalankan: ${hashlist.length}`);

    const resultTable = [];
    const batchSize = 10; // Process 10 accounts at a time

    for (let batchStart = 0; batchStart < hashlist.length; batchStart += batchSize) {
      const batch = hashlist.slice(batchStart, batchStart + batchSize);

      for (let i = 0; i < batch.length; i++) {
        console.log(`\n[ ${new Date().toLocaleString()} ] Sedang login akun ke ${batchStart + i + 1} dari ${hashlist.length}`);
        const hash = batch[i].trim();
        const result = await login(hash).catch(err => {
          console.log(`[ ${new Date().toLocaleString()} ] Error during login: ${err}`);
          return null;
        });
        let token = result?.access_token;
        let resulttembak = null;

        if (token) {
          console.log(`[ ${new Date().toLocaleString()} ] Berhasil login, akun ${result.player.full_name}`);
          let keepGoing = true;

          while (keepGoing) {
            try {
              resulttembak = await tembak(token).catch(err => {
                console.log(`[ ${new Date().toLocaleString()} ] Error during submit_taps: ${err}`);
                return null;
              });

              if (!resulttembak?.player?.energy) {
                console.log(`[ ${new Date().toLocaleString()} ] Energy tidak ditemukan, mencoba login ulang`);
                const reloginres = await login(hash).catch(err => {
                  console.log(`[ ${new Date().toLocaleString()} ] Error during relogin: ${err}`);
                  return null;
                });
                token = reloginres?.access_token;
                if (!token) {
                  console.log(`[ ${new Date().toLocaleString()} ] Gagal login ulang, menunggu 15 menit sebelum mencoba lagi`);
                  await new Promise(r => setTimeout(r, 900000)); // Delay 15 minutes
                  continue;
                }
                continue;
              }

              console.log(`[ ${new Date().toLocaleString()} ] Energi tinggal ${resulttembak.player.energy}`);
              console.log(`[ ${new Date().toLocaleString()} ] Balance ${resulttembak.player.shares}`);

              const boostres = await applyboost(token).catch(err => {
                console.log(`[ ${new Date().toLocaleString()} ] Error during apply_boost: ${err}`);
                return null;
              });

              if (boostres?.statusCode === 200) {
                console.log(`[ ${new Date().toLocaleString()} ] Berhasil apply boost`);
                continue;
              }

              if (resulttembak.player.energy <= 100) {
                console.log(`[ ${new Date().toLocaleString()} ] Energi tinggal ${resulttembak.player.energy}`);
                keepGoing = false;
              }
            } catch (err) {
              console.log(`[ ${new Date().toLocaleString()} ] Unexpected error: ${err}`);
              keepGoing = false;
            }
          }

          resultTable.push({
            'Full Name': result.player.full_name,
            'Energy': resulttembak?.player?.energy,
            'Balance': resulttembak?.player?.shares
          });
        } else {
          console.log(`[ ${new Date().toLocaleString()} ] Login failed: ${result}`);
        }

        // Delay 5 minutes between each account
        console.log(`[ ${new Date().toLocaleString()} ] Menunggu 5 menit sebelum akun berikutnya`);
        await new Promise(r => setTimeout(r, 150000)); // Delay 5 minutes
      }

      console.log(`\n[ ${new Date().toLocaleString()} ] Batch selesai, delay 2 menit sebelum batch berikutnya`);
      console.table(resultTable);
      await new Promise(r => setTimeout(r, 60000 * 2)); // Delay 2 minutes between batches
    }

    console.log(`\n[ ${new Date().toLocaleString()} ] Semua akun selesai diproses, memulai ulang dari awal`);
  }
};

main();
