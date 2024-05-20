const fs = require('fs');

const tembak = (token) => {
  return new Promise((resolve, reject) => {
    const randomtap = Math.floor(Math.random() * 50) + 50;
    fetch('https://api.tapswap.ai/api/player/submit_taps', {
      method: 'POST',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 11; Galaxy S7 Build/RQ1A.210105.003; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.120 Mobile Safari/537.36',
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
      .then((response) => {
        response.json().then((data) => {
          resolve(data);
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const login = (hash) => {
  return new Promise((resolve, reject) => {
    fetch('https://api.tapswap.ai/api/account/login', {
      method: 'POST',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 11; Galaxy S7 Build/RQ1A.210105.003; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.120 Mobile Safari/537.36',
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
      .then((response) => {
        response.json().then((data) => {
          resolve(data);
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const applyboost = (token) => {
  return new Promise((resolve, reject) => {
    fetch('https://api.tapswap.ai/api/player/apply_boost', {
      method: 'POST',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 11; Galaxy S7 Build/RQ1A.210105.003; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.120 Mobile Safari/537.36',
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
      .then(async (response) => {
        //return json
        resolve(await response.json());
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const main = async () => {
  console.clear();
  const hashlist = fs.readFileSync('hash.txt', 'utf8').trim().split('\n');
  console.log(
    `[ ${new Date().toLocaleString()} ] Total akun yang akan dijalankan: ${
      hashlist.length
    }`
  );
  while (true) {
    for (let i = 0; i < hashlist.length; i++) {
      console.log(
        `\n[ ${new Date().toLocaleString()} ] Sedang login akun ke ${
          i + 1
        } dari ${hashlist.length}`
      );
      const hash = hashlist[i].trim();
      const result = await login(hash).catch((err) => err);
      let token = result?.access_token;
      if (token) {
        console.log(
          `[ ${new Date().toLocaleString()} ] Berhasil login, akun ${
            result.player.full_name
          }`
        );
        while (true) {
          try {
            const resulttembak = await tembak(token).catch((err) => err);
            if (!resulttembak?.player?.energy) {
              const reloginres = await login().catch((err) => err);
              token = reloginres?.access_token;
              continue;
            }
            console.log(
              `[ ${new Date().toLocaleString()} ] Energi tinggal ${
                resulttembak?.player?.energy
              }`
            );
            console.log(
              `[ ${new Date().toLocaleString()} ] Balance ${
                resulttembak.player.shares
              }`
            );
            const boostres = await applyboost(token).catch((err) => err);
            if (boostres?.statusCode === 200) {
              console.log(
                `[ ${new Date().toLocaleString()} ] Berhasil apply boost`
              );
              continue;
            }
            if (resulttembak?.player?.energy <= 100) {
              console.log(
                `[ ${new Date().toLocaleString()} ] Energi tinggal ${
                  resulttembak.player.energy
                }`
              );
              break;
            } else {
              const delay = 100 + Math.random() * 100;
              console.log(
                `[ ${new Date().toLocaleString()} ] Delay ${delay} ms`
              );
              await new Promise((r) => setTimeout(r, delay));
            }
          } catch (err) {
            console.log(err);
            process.exit(1);
          }
        }
      } else {
        console.log(result);
      }
    }
    console.log(
      `\n[ ${new Date().toLocaleString()} ] Selesai semua akun, delay 10 menit`
    );
    await new Promise((r) => setTimeout(r, 60000 * 10));
  }
};

main();
