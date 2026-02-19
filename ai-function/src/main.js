const Groq = require('groq-sdk');

module.exports = async ({ req, res, log, error }) => {
    if (req.method === 'GET') return res.send("Alkhabir AI (Powered by Groq) is ready!");

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

        // Default to 'analyze' if not specified, for backward compatibility or simple calls
        const type = body.type || 'analyze';
        const query = body.description || body.query; // Support both naming conventions

        if (!query) return res.json({ success: false, error: "المدخلات غير كافية." }, 400);

        log(`Processing request type: ${type} for: ${query.substring(0, 50)}...`);

        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY
        });

        let systemPrompt = "";
        let userPrompt = query;
        let model = "llama-3.3-70b-versatile";
        let responseFormat = null; // Default to text

        switch (type) {
            case 'analyze':
                systemPrompt = `أنت مستشار قانوني مغربي خبير. قم بتحليل الوقائع المقدمة لك تحليلاً قانونياً أكاديمياً ورصيناً.
                    يجب أن يكون الرد بصيغة JSON فقط، وبدون أي نص إضافي خارج كائن JSON.
                    البنية المطلوبة للرد (JSON structure):
                    {
                      "نوع_القضية": "تصنيف دقيق (مثلاً: مدني - عقاري)",
                      "الوقائع_الجوهرية": [ "قائمة بالوقائع" ],
                      "التكييف_القانوني": [ "الإشكاليات القانونية" ],
                      "النصوص_القانونية_ذات_الصلة": [ "الفصول القانونية" ],
                      "العناصر_المادية_والمعنوية": [ "التحليل" ],
                      "الدفاعات_الممكنة": [ "الحجج" ],
                      "سوابق_قضائية_مغربية_محتملة": [ "الاجتهادات القضائية" ],
                      "الإجراءات_المقترحة": [ "الخطوات العملية" ],
                      "تحليل_النازلة": "تحليل مفصل"
                    }`;
                responseFormat = { type: "json_object" }; // Valid if supported by Groq, otherwise we parse manually
                break;

            case 'question':
                systemPrompt = `تصرف كمحامٍ وخبير قانوني مغربي، وأستاذ جامعي.
                    عند الإجابة على أي سؤال:
                    1. ضع الموضوع في سياقه القانوني المغربي.
                    2. استشهد بالفصول والمواد القانونية بدقة.
                    3. اذكر الاجتهادات القضائية إن وجدت.
                    4. إذا لم يوجد نص صريح، قل ذلك بوضوح.
                    اجعل إجابتك مهنية، دقيقة، ومباشرة.`;
                break;

            case 'suggest':
                systemPrompt = `أنت مستشار قانوني ذكي. بناءً على المعطيات التالية، اقترح 5 إلى 7 أسئلة قانونية دقيقة تساعد على توضيح القضية.
                    اكتب فقط الأسئلة، كل سؤال في سطر جديد، بدون مقدمات أو ترقيم.`;
                break;

            case 'ocr':
                systemPrompt = `أنت خبير في النسخ الرقمي (OCR). استخرج النص العربي من الصورة بدقة.`;
                model = "llama-3.2-11b-vision-preview"; // Vision model
                break;

            default:
                return res.json({ success: false, error: "نوع الطلب غير معروف" }, 400);
        }

        let messages = [
            { role: "system", content: systemPrompt }
        ];

        if (type === 'ocr' && body.image) {
            messages.push({
                role: "user",
                content: [
                    { type: "text", text: userPrompt || "استخرج النص من هذه الصورة." },
                    { type: "image_url", image_url: { url: body.image } } // Expecting data URL or URL
                ]
            });
        } else {
            messages.push({ role: "user", content: userPrompt });
        }

        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: model,
            temperature: 0.5,
            response_format: responseFormat
        });

        let result = chatCompletion.choices[0]?.message?.content || "";

        // Post-processing based on type
        if (type === 'analyze') {
            // Clean up markdown code blocks if present
            result = result.replace(/```json\n?|\n?```/g, "").trim();
            try {
                // Validate JSON but returns string to frontend (or object if preferred, kept string for consistency)
                JSON.parse(result);
            } catch (e) {
                console.error("Failed to parse JSON from LLM", e);
                result = "{}"; // Fallback
            }
        }

        return res.json({
            success: true,
            analysis: result, // For 'analyze', this is JSON string. For others, it's text.
            result: result // Generic field for other types
        });

    } catch (err) {
        error(`Groq Error: ${err.message}`);
        return res.json({ success: false, error: err.message }, 500);
    }
};