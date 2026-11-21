// لاگ‌های آموزشی: مسیر کامل یک درخواست را در ترمینال می‌بینید:
// درخواست ورودی → Route → Middleware → Controller → Model → MongoDB → پاسخ خروجی

let counter = 0;

export function nextRequestId() {
  return ++counter;
}

const now = () => new Date().toISOString();
const pretty = (value) => JSON.stringify(value, null, 2);

export function logRequest(req) {
  req.logged = true;
  console.log('\n' + '═'.repeat(72));
  console.log(`📥 #${req.id} درخواست ورودی  [${now()}]`);
  console.log(`   ${req.method} ${req.url}`);
  console.log('   headers:', pretty(req.headers));
  console.log('   body   :', pretty(req.body ?? {}));
}

// یک مرحله از مسیر پردازش (ROUTE / MIDDLEWARE / CONTROLLER)
export function logStep(req, layer, message) {
  console.log(`   ↳ #${req.id} [${layer}] ${message}`);
}

// عملیات روی دیتابیس (لایه Model)
export function logDb(message) {
  console.log(`   ↳ [MONGODB] ${message}`);
}

export function logResponse(req, status, data) {
  const ms = Date.now() - req.startTime;
  console.log(`📤 #${req.id} پاسخ خروجی  ${status}  (${ms}ms)`);
  console.log('   body   :', pretty(data));
}
