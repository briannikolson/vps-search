const { collectAllProviders } = require('./collect-providers');
const { scrapeAllPrices } = require('./scrape-prices');
const fs = require('fs');
const path = require('path');

async function fullUpdate() {
    console.log('\n🔄 ========== НАЧАЛО ОБНОВЛЕНИЯ ==========\n');
    
    console.log('📦 Шаг 1: Сбор провайдеров...');
    await collectAllProviders();
    
    console.log('\n💰 Шаг 2: Генерация цен...');
    await scrapeAllPrices();
    
    console.log('\n✅ ========== ОБНОВЛЕНИЕ ЗАВЕРШЕНО ==========\n');
}

if (require.main === module) {
    fullUpdate().catch(console.error);
}

module.exports = { fullUpdate };
