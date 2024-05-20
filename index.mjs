import fs from 'fs';
import fetch from 'node-fetch';

// Function to make fetch requests with a timeout
const fetchWithTimeout = (url, options, timeout = 5000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), timeout))
  ]);
};

const tembak = async (token, retries = 3) => {
  const randomtap = Math.floor(Math.random() * 50) + 50;
  try {
    const response = await fetchWithTimeout('https://api.tapswap.ai/api/player/submit_taps', {
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
    });
    return await response.json();
  } catch (error) {
    if (retries > 0) {
      console.log(`[ ${new Date().toLocaleString()} ] Error during submit_taps, retrying...: ${error}`);
      return tembak(token, retries - 1);
    }
    throw error;
  }
};

const login = async (hash, retries = 3) => {
  try {
    const response = await fetchWithTimeout('https://api.tapswap.ai/api/account/login', {
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
    });
    return await response.json();
  } catch (error) {
    if (retries > 0) {
      console.log(`[ ${new Date().toLocaleString()} ] Error during login, retrying...: ${error}`);
      return login(hash, retries - 1);
    }
    throw error;
  }
};

const applyboost = async (token, retries = 3) => {
  try {
    const response = await fetchWithTimeout('https://api.tapswap.ai/api/player/apply_boost', {
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
    });
    return await response.json();
  } catch (error) {
    if (retries > 0) {
      console.log(`[ ${new Date().toLocaleString()} ] Error during apply_boost, retrying...: ${error}`);
      return applyboost(token, retries - 1);
    }
    throw error;
  }
};

const main = async () => {
  console.clear();
  const hashlist = fs.readFileSync('hash.txt', 'utf8').trim().split('\n');
  console.log(`[ ${new Date().toLocaleString()} ] Total akun yang akan dijalankan: ${hashlist.length}`);
  
  while (true) {
    for (let i = 0; i < hashlist.length; i++) {
      console.log(`\n[ ${new Date().toLocaleString()} ] Sedang login akun ke ${i + 1} dari ${hashlist.length}`);
      const hash = hashlist[i].trim();
      let result;
      
      try {
        result = await login(hash);
      } catch (err) {
        console.log(`[ ${new Date().toLocaleString()} ] Error during login: ${err}`);
        continue;
      }

      let token = result?.access_token;
      
      if (token) {
        console.log(`[ ${new Date().toLocaleString()} ] Berhasil login, akun ${result.player.full_name}`);
        let keepGoing = true;
        
        while (keepGoing) {
          try {
            const resulttembak = await tembak(token).catch(err => {
              console.log(`[ ${new Date().toLocaleString()} ] Error during submit_taps: ${err}`);
              return null;
            });
            
            if (!resulttembak?.player?.energy) {
              const reloginres = await login(hash).catch(err => {
                console.log(`[ ${new Date().toLocaleString()} ] Error during relogin: ${err}`);
                return null;
              });
              token = reloginres?.access_token;
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
            } else {
              const delay = 100 + Math.random() * 100;
              console.log(`[ ${new Date().toLocaleString()} ] Delay ${delay} ms`);
              await new Promise(r => setTimeout(r, delay));
            }
          } catch (err) {
            console.log(`[ ${new Date().toLocaleString()} ] Unexpected error: ${err}`);
            keepGoing = false;
          }
        }
      } else {
        console.log(`[ ${new Date().toLocaleString()} ] Login failed: ${result}`);
      }
    }
    console.log(`\n[ ${new Date().toLocaleString()} ] Selesai semua akun`);
  }
};

main();
