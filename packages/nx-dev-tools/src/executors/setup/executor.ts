import * as fs from 'fs';
import * as path from 'path';
import { ExecutorContext, ProjectConfiguration } from '@nx/devkit';
import { getProjectConfig, readDevToolsConfig } from '../utils';
import { SetupExecutorSchema } from './schema';
import { execSync } from 'child_process';

export default async function runExecutor({ command }: SetupExecutorSchema, context: ExecutorContext) {
  const projectConfig = getProjectConfig(context);
  if (!projectConfig) {
    return { success: false };
  }

  switch (command) {
    case 'cert':
      createCert(projectConfig);
      break;
    case 'network-up':
      setupNetwork(projectConfig);
      break;
    case 'network-down':
      removeNetwork(projectConfig);
      break;
    default:
      return {
        success: false,
      };
  }

  return {
    success: true,
  };
}

const createCert = (projectConfig: ProjectConfiguration): void => {
  const { primaryDomain } = readDevToolsConfig(projectConfig.root);

  const targetDir = path.join(projectConfig.root, 'reverse-proxy', 'certificates', 'primary');

  fs.mkdirSync(targetDir, { recursive: true });

  // Create root cert and key
  console.log('=> Creating Root CA...');
  const subject = '/C=AU/ST=None/L=None/O=None/CN=root.com';

  execSync(`openssl genrsa -out ${targetDir}/rootCA.key 2048`);
  execSync(
    `openssl req -x509 -new -nodes -key ${targetDir}/rootCA.key -subj "${subject}" -sha256 -days 1024 -out ${targetDir}/rootCA.pem`
  );
  console.log('=> Successfully created Root CA!');
  // Done root cert and key

  // Create infra cert
  const projectSubject = `/C=AU/ST=Victoria/L=Melbourne/O=None/CN=${primaryDomain}`;
  const validDurationInDays = 365;
  const tmpExtFile = path.join(targetDir, '__v3.ext');

  console.log(`=> Creating certificate for "${primaryDomain}"...`);

  execSync(
    `openssl req -new -newkey rsa:2048 -sha256 -nodes -keyout ${targetDir}/device.key -subj "${projectSubject}" -out ${targetDir}/device.csr`
  );

  fs.writeFileSync(
    tmpExtFile,
    `authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = ${primaryDomain}`
  );

  execSync(
    `openssl x509 \
    -req -in ${targetDir}/device.csr \
    -CA ${targetDir}/rootCA.pem \
    -CAkey ${targetDir}/rootCA.key \
    -CAserial ${targetDir}/.srl \
    -CAcreateserial \
    -out ${targetDir}/device.crt \
    -days ${validDurationInDays} \
    -sha256 \
    -extfile ${tmpExtFile}`
  );

  console.log(`=> Successfully created certificate for "${targetDir}"!`);
  // Done infra cert

  // Trust Root CA
  console.log('=> Trusting Root CA...');
  execSync(
    `sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ${targetDir}/rootCA.pem`
  );
  console.log('=> Successfully trusted Root CA!');
};

const resolverDir = '/etc/resolver';
const setupNetwork = (projectConfig: ProjectConfiguration): void => {
  const { primaryDomain } = readDevToolsConfig(projectConfig.root);
  const hostResolverFile = path.join(resolverDir, primaryDomain);

  if (fs.existsSync(hostResolverFile)) {
    removeNetwork(projectConfig);
  }

  execSync(`sudo mkdir -p ${resolverDir}`);

  execSync(
    `sudo sh -c "echo '# This is auto-generated. Do NOT edit this file\nnameserver 127.0.0.1 \nport 53535' >> ${hostResolverFile}"`
  );
  console.log(`=> Successfully created resolver file: ${hostResolverFile}`);
};

const removeNetwork = (projectConfig: ProjectConfiguration): void => {
  const { primaryDomain } = readDevToolsConfig(projectConfig.root);
  const hostResolverFile = path.join(resolverDir, primaryDomain);

  if (fs.existsSync(hostResolverFile)) {
    execSync(`sudo rm ${hostResolverFile}`);
    console.log(`=> Successfully removed resolver file: ${hostResolverFile}`);
  } else {
    console.log(`=> ${hostResolverFile} does not exist. Skipping...`);
  }
};
