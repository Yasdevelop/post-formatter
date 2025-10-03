// Simple Express server that serves the client, handles subscription stub, generates a short video from text,
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true }));


const CLIENT_BUILD = path.join(__dirname, '..', 'client');
app.use(express.static(CLIENT_BUILD));


// Health
app.get('/api/health', (req, res) => res.json({ ok: true }));


// Create a stripe subscription session (stubbed minimal flow)
app.post('/api/create-subscription', async (req, res) => {
// In production: create Stripe Checkout session and return session.url
// Here we stub a successful subscription and return a fake customer id
const fakeCustomerId = 'cust_' + shortid.generate();
return res.json({ success: true, customerId: fakeCustomerId, message: 'Pretend subscription created (demo)' });
});


// Generate video from text (synchronous for demo; long jobs should be queued)
app.post('/api/generate-video', async (req, res) => {
try {
const { text, platform, size } = req.body;
if (!text || text.trim().length === 0) return res.status(400).json({ error: 'No text provided' });
const jobId = 'job_' + shortid.generate();
const out = await createVideoFromText({ text, outName: `${jobId}.mp4`, size: size || 'landscape' });
// out.url is a local path; in prod upload to Mux/Cloudinary and return that URL
return res.json({ ok: true, jobId, videoPath: out.path });
} catch (err) {
console.error(err);
return res.status(500).json({ error: err.message });
}
});


// Post to X (simulated) — for demo we just call the simulator which returns success
app.post('/api/post/x', async (req, res) => {
const { videoPath, caption } = req.body;
if (!videoPath) return res.status(400).json({ error: 'No videoPath' });
const result = await simulateXPost({ videoPath, caption });
return res.json(result);
});


// Stripe webhook endpoint (demo): just logs and calls handler
app.post('/webhook/stripe', bodyParser.raw({ type: 'application/json' }), (req, res) => {
try {
handleStripeWebhook(req, res);
} catch (e) {
console.error('Stripe webhook error', e);
res.status(400).send(`Webhook error: ${e.message}`);
}
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port', PORT));
