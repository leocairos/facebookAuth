import appModel from './app';
import router from './routes';
import https from 'https';
import http from 'http';
import fs from 'fs';

(async () => {

  try {
    const portHTTP = parseInt(`${process.env.PORT_HTTP}`);
    const portHTTPS = parseInt(`${process.env.PORT_HTTPS}`);

    //await app(router).listen(port);
    const app = await appModel(router);

    // Listen both http & https ports
    const httpServer = http.createServer(app);
    const httpsServer = https.createServer({
      key: fs.readFileSync('key.pem'),
      cert: fs.readFileSync('cert.pem'),
    }, app);

    httpServer.listen(portHTTP, () => {
      console.log(`[${process.env.MS_NAME}]-HTTP Running on port ${portHTTP}...`);
    });

    httpsServer.listen(portHTTPS, () => {
      console.log(`[${process.env.MS_NAME}]-HTTPS Running on port ${portHTTPS}...`);
    });

  } catch (error) {
    console.log(`${error}`);
  }

})();