import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const chatgptEmail = process.env.CHATGPT_EMAIL;
const chatgptPassword = process.env.CHATGPT_PASSWORD;
const apiKey = process.env.CHATGPT_API_KEY;
async function seedApiKey() {
  let apiKeys = [];
  try {
    apiKeys = require('../apikey.json');
  } catch (err) {
    if (!apiKey) {
      console.error('No apikey.json found, and no env variables found');
      return;
    }
    apiKeys = [apiKey];
    console.log('No apikey.json found, using env variables');
  }
  console.log('Seeding API Keys...');
  console.log(apiKeys);
  await prisma.chatGPTAPIKey.deleteMany();
  await prisma.chatGPTAPIKey.createMany({
    data: apiKeys.map((apiKey) => ({
      apiKey,
      status: 'Active',
    })),
  });
  console.log('Seed API Key Success!');
}
async function seedAccount() {
  let accounts = [];
  //  try read ../account.json as accounts
  try {
    accounts = require('../account.json');
  } catch (err) {
    if (!chatgptEmail || !chatgptPassword) {
      console.error('No account.json found, and no env variables found');
      return;
    }
    accounts = [
      {
        email: chatgptEmail,
        password: chatgptPassword,
      },
    ];
    console.log('No account.json found, using env variables');
  }
  console.log('Seeding accounts...');
  console.log(accounts);
  await prisma.chatGPTAccount.deleteMany();
  await prisma.chatGPTAccount.createMany({
    data: accounts,
  });
  console.log('Seed Success!');
}
async function main() {
  await seedAccount();
  await seedApiKey();
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
