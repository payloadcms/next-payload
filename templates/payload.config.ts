import path from 'path';
import { buildConfig } from 'payload/config';

export default buildConfig({
  collections: [
    // Your collections here
  ],
  globals: [
    // Your globals here
  ],
  typescript: {
    outputFile: path.resolve(__dirname, '../payload-types.ts'),
  },
});
