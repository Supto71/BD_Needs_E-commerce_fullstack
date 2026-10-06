const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const AdmZip = require('adm-zip');

const rootDir = path.resolve(__dirname, '..');
process.chdir(rootDir);
const standaloneDir = path.join(rootDir, '.next', 'standalone');

console.log('--- Starting cPanel Build Preparation ---');

// 1. Generate Prisma Client with all binary targets
console.log('\n> Generating Prisma Client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
} catch (error) {
  console.error('\nPrisma generation failed! Aborting cPanel preparation.');
  process.exit(1);
}

// 2. Build the Next.js app
console.log('\n> Running next build...');
try {
  execSync('npx next build --webpack', { stdio: 'inherit' });
} catch (error) {
  console.error('\nBuild failed! Aborting cPanel preparation.');
  process.exit(1);
}

// 3. Ensure standalone directory exists
if (!fs.existsSync(standaloneDir)) {
  console.error('\nError: .next/standalone directory not found.');
  console.error('Make sure output: "standalone" is in your next.config.ts');
  process.exit(1);
}

// Helper to copy directories recursively
function copyDirectorySync(src, dest) {
  if (!fs.existsSync(src)) return;
  
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectorySync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 4. Copy static and public assets
console.log('\n> Copying public and static folders to standalone directory...');
// Always copy to root of standalone
copyDirectorySync(
  path.join(rootDir, 'public'),
  path.join(standaloneDir, 'public')
);
copyDirectorySync(
  path.join(rootDir, '.next', 'static'),
  path.join(standaloneDir, '.next', 'static')
);

// If Next.js outputted into standalone/frontend (monorepo subfolder)
const subFrontendDir = path.join(standaloneDir, 'frontend');
if (fs.existsSync(subFrontendDir)) {
  console.log('> Detected standalone/frontend subfolder. Copying assets there too...');
  copyDirectorySync(
    path.join(rootDir, 'public'),
    path.join(subFrontendDir, 'public')
  );
  copyDirectorySync(
    path.join(rootDir, '.next', 'static'),
    path.join(subFrontendDir, '.next', 'static')
  );

  // Also create a root server.js launcher if not present
  const rootServerJs = path.join(standaloneDir, 'server.js');
  if (!fs.existsSync(rootServerJs)) {
    fs.writeFileSync(
      rootServerJs,
      "// cPanel Passenger launcher\nrequire('./frontend/server.js');\n"
    );
  }
}

// 5. Copy Prisma Client to standalone node_modules
console.log('\n> Copying Prisma client to standalone node_modules...');
const standaloneNodeModules = path.join(standaloneDir, 'node_modules');

copyDirectorySync(
  path.join(rootDir, 'node_modules', '.prisma'),
  path.join(standaloneNodeModules, '.prisma')
);
copyDirectorySync(
  path.join(rootDir, 'node_modules', '@prisma'),
  path.join(standaloneNodeModules, '@prisma')
);

if (fs.existsSync(subFrontendDir)) {
  const subNodeModules = path.join(subFrontendDir, 'node_modules');
  copyDirectorySync(
    path.join(rootDir, 'node_modules', '.prisma'),
    path.join(subNodeModules, '.prisma')
  );
  copyDirectorySync(
    path.join(rootDir, 'node_modules', '@prisma'),
    path.join(subNodeModules, '@prisma')
  );
}

// 6. Copy Prisma Schema
console.log('\n> Copying prisma schema...');
copyDirectorySync(
  path.join(rootDir, 'prisma'),
  path.join(standaloneDir, 'prisma')
);
if (fs.existsSync(subFrontendDir)) {
  copyDirectorySync(
    path.join(rootDir, 'prisma'),
    path.join(subFrontendDir, 'prisma')
  );
}

// 6b. Bundle seed script into plain JS (production has no tsx and no src/ folder)
console.log('\n> Bundling prisma/seed.ts -> prisma/seed.js...');
try {
  const esbuild = require('esbuild');
  const seedTargets = [path.join(standaloneDir, 'prisma', 'seed.js')];
  if (fs.existsSync(subFrontendDir)) {
    seedTargets.push(path.join(subFrontendDir, 'prisma', 'seed.js'));
  }
  for (const outfile of seedTargets) {
    esbuild.buildSync({
      entryPoints: [path.join(rootDir, 'prisma', 'seed.ts')],
      bundle: true,
      platform: 'node',
      format: 'cjs',
      target: 'node18',
      external: ['@prisma/client', '.prisma/client'],
      tsconfig: path.join(rootDir, 'tsconfig.json'),
      outfile,
      logLevel: 'warning',
    });
  }
} catch (error) {
  console.error('\nSeed bundling failed! Aborting cPanel preparation.', error);
  process.exit(1);
}

// 7. Copy sample .env to standalone
const sampleEnv = path.join(rootDir, '.env.example');
if (fs.existsSync(sampleEnv)) {
  fs.copyFileSync(sampleEnv, path.join(standaloneDir, '.env.example'));
}

// 7. Zip the standalone folder
console.log('\n> Zipping the build for cPanel (bdneeds-cpanel-ready.zip)...');

try {
  const zip = new AdmZip();
  zip.addLocalFolder(standaloneDir);
  const zipPath = path.join(rootDir, 'bdneeds-cpanel-ready.zip');
  zip.writeZip(zipPath);
  
  console.log(`\n=== cPanel Build Complete! ===`);
  console.log(`Successfully created: bdneeds-cpanel-ready.zip`);
  console.log(`\nInstructions for cPanel Deployment:`);
  console.log(`1. Upload 'bdneeds-cpanel-ready.zip' to your cPanel File Manager and extract it.`);
  console.log(`2. Setup a "Setup Node.js App" in cPanel.`);
  console.log(`3. Set the Application root to the extracted folder.`);
  console.log(`4. Set the Application startup file to 'server.js'.`);
  console.log(`5. Add your environment variables (DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET, etc.).`);
  console.log(`6. Import 'cpanel-mysql-init.sql' into your cPanel phpMyAdmin database.`);
  console.log(`7. Start / Restart the Node.js App in cPanel.`);
  console.log(`--------------------------------------`);
} catch (err) {
  console.error("Error creating zip file:", err);
  process.exit(1);
}
