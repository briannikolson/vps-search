const axios = require('axios');
const fs = require('fs');
const path = require('path');

const PROVIDERS_FILE = path.join(__dirname, '../data/providers.json');

async function fetchFromGitHub() {
    console.log('  📦 GitHub провайдеры...');
    try {
        const response = await axios.get('https://raw.githubusercontent.com/s0c-org/Providers/main/providers.json', {
            timeout: 10000,
            headers: { 'User-Agent': 'VPS-Finder/2.0' }
        });
        return response.data.map(p => ({
            name: p.name,
            website: p.link,
            source: 'GitHub'
        }));
    } catch (error) {
        console.log(`      Ошибка: ${error.message}`);
        return [];
    }
}

function getFallbackProviders() {
    return [
        { name: "Hetzner", website: "hetzner.com", source: "Fallback" },
        { name: "DigitalOcean", website: "digitalocean.com", source: "Fallback" },
        { name: "Vultr", website: "vultr.com", source: "Fallback" },
        { name: "Linode", website: "linode.com", source: "Fallback" },
        { name: "OVHcloud", website: "ovhcloud.com", source: "Fallback" },
        { name: "Contabo", website: "contabo.com", source: "Fallback" },
        { name: "AWS", website: "aws.amazon.com", source: "Fallback" },
        { name: "Google Cloud", website: "cloud.google.com", source: "Fallback" },
        { name: "Azure", website: "azure.microsoft.com", source: "Fallback" },
        { name: "Scaleway", website: "scaleway.com", source: "Fallback" },
        { name: "UpCloud", website: "upcloud.com", source: "Fallback" },
        { name: "Netcup", website: "netcup.eu", source: "Fallback" },
        { name: "RackNerd", website: "racknerd.com", source: "Fallback" },
        { name: "BuyVM", website: "buyvm.net", source: "Fallback" },
        { name: "Hostinger", website: "hostinger.com", source: "Fallback" },
        { name: "Alibaba Cloud", website: "alibabacloud.com", source: "Fallback" },
        { name: "Tencent Cloud", website: "tencentcloud.com", source: "Fallback" },
        { name: "Kamatera", website: "kamatera.com", source: "Fallback" },
        { name: "IONOS", website: "ionos.com", source: "Fallback" }
    ];
}

async function collectAllProviders() {
    console.log('\n🕷️ СБОР ПРОВАЙДЕРОВ\n');
    
    let providers = await fetchFromGitHub();
    
    if (providers.length === 0) {
        console.log('  ⚠️ Используем fallback список');
        providers = getFallbackProviders();
    }
    
    const unique = new Map();
    for (const p of providers) {
        const key = p.name.toLowerCase();
        if (!unique.has(key)) {
            unique.set(key, p);
        }
    }
    
    const result = {
        providers: Array.from(unique.values()),
        totalCount: unique.size,
        lastUpdate: new Date().toISOString()
    };
    
    fs.writeFileSync(PROVIDERS_FILE, JSON.stringify(result, null, 2));
    console.log(`\n✅ Сохранено ${result.totalCount} провайдеров\n`);
}

if (require.main === module) {
    collectAllProviders();
}

module.exports = { collectAllProviders };
