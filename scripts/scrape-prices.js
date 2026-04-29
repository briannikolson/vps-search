const fs = require('fs');
const path = require('path');

const PROVIDERS_FILE = path.join(__dirname, '../data/providers.json');
const VPS_DATA_FILE = path.join(__dirname, '../data/vps-data.json');

const knownPlans = {
    'Hetzner': [
        { cpu: '2 vCPU', ram: '4 GB', storage: '40 GB NVMe', bandwidth: '20 TB', price: 4.15 },
        { cpu: '4 vCPU', ram: '8 GB', storage: '80 GB NVMe', bandwidth: '20 TB', price: 8.30 }
    ],
    'DigitalOcean': [
        { cpu: '2 vCPU', ram: '2 GB', storage: '60 GB SSD', bandwidth: '3 TB', price: 12 },
        { cpu: '2 vCPU', ram: '4 GB', storage: '80 GB SSD', bandwidth: '4 TB', price: 18 }
    ],
    'Vultr': [
        { cpu: '1 vCPU', ram: '2 GB', storage: '64 GB SSD', bandwidth: '3 TB', price: 13 },
        { cpu: '2 vCPU', ram: '4 GB', storage: '80 GB SSD', bandwidth: '4 TB', price: 22 }
    ],
    'Contabo': [
        { cpu: '4 vCPU', ram: '8 GB', storage: '200 GB SSD', bandwidth: '32 TB', price: 6.99 },
        { cpu: '6 vCPU', ram: '16 GB', storage: '400 GB SSD', bandwidth: '32 TB', price: 11.99 }
    ],
    'RackNerd': [
        { cpu: '1 vCPU', ram: '1 GB', storage: '20 GB SSD', bandwidth: '4 TB', price: 1.99 },
        { cpu: '2 vCPU', ram: '3 GB', storage: '60 GB SSD', bandwidth: '8 TB', price: 4.99 }
    ],
    'BuyVM': [
        { cpu: '1 vCPU', ram: '1 GB', storage: '20 GB NVMe', bandwidth: '10 TB', price: 3.50 },
        { cpu: '2 vCPU', ram: '2 GB', storage: '40 GB NVMe', bandwidth: '10 TB', price: 7 }
    ],
    'Hostinger': [
        { cpu: '2 vCPU', ram: '4 GB', storage: '100 GB SSD', bandwidth: '4 TB', price: 6.99 },
        { cpu: '4 vCPU', ram: '8 GB', storage: '200 GB SSD', bandwidth: '8 TB', price: 11.99 }
    ]
};

function getFlag(country) {
    const flags = { 'Germany': '🇩🇪', 'USA': '🇺🇸', 'UK': '🇬🇧', 'France': '🇫🇷', 
                    'Netherlands': '🇳🇱', 'Singapore': '🇸🇬', 'Canada': '🇨🇦', 'Global': '🌍' };
    return flags[country] || '🌍';
}

async function scrapeAllPrices() {
    console.log('\n💰 ГЕНЕРАЦИЯ ЦЕН\n');
    
    let providers = [];
    if (fs.existsSync(PROVIDERS_FILE)) {
        const data = JSON.parse(fs.readFileSync(PROVIDERS_FILE, 'utf8'));
        providers = data.providers;
    }
    
    const servers = [];
    let id = 1;
    
    for (const provider of providers) {
        const plans = knownPlans[provider.name] || [{ cpu: '2 vCPU', ram: '4 GB', storage: '80 GB SSD', bandwidth: 'Variable', price: null }];
        const countries = provider.name === 'Hetzner' ? ['Germany', 'USA', 'Finland'] :
                         provider.name === 'DigitalOcean' ? ['USA', 'Germany', 'Singapore', 'India'] :
                         provider.name === 'Vultr' ? ['USA', 'Germany', 'Japan', 'Singapore'] :
                         provider.name === 'Contabo' ? ['Germany', 'USA', 'Singapore'] :
                         ['Global'];
        
        for (const plan of plans) {
            for (const country of countries) {
                servers.push({
                    id: id++,
                    provider: provider.name,
                    country: country,
                    flag: getFlag(country),
                    continent: country === 'Global' ? 'Global' : 
                              (['Germany', 'UK', 'France', 'Netherlands', 'Finland'].includes(country) ? 'Europe' : 'Global'),
                    cpu: plan.cpu,
                    ram: plan.ram,
                    storage: plan.storage,
                    bandwidth: plan.bandwidth,
                    price: plan.price,
                    period: 'month',
                    website: provider.website,
                    source: 'Base data',
                    lastUpdated: new Date().toISOString()
                });
            }
        }
    }
    
    const output = {
        servers: servers,
        totalCount: servers.length,
        lastUpdate: new Date().toISOString()
    };
    
    fs.writeFileSync(VPS_DATA_FILE, JSON.stringify(output, null, 2));
    console.log(`✅ Создано ${servers.length} VPS конфигураций\n`);
}

if (require.main === module) {
    scrapeAllPrices();
}

module.exports = { scrapeAllPrices };
