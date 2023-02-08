import { startService } from './app';
import { config } from './app.config';

const app = startService({ createSwagger: process.env.NODE_ENV !== 'development' });
app.listen(config.port, () => {
  console.info('Start success at port:' + config.port);
});
