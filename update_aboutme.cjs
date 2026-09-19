const fs = require('fs');

const path = 'src/components/SettingsView.tsx';
let code = fs.readFileSync(path, 'utf-8');

const targetStr = `      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-primary-600 dark:text-primary-500 mb-2">
          <Info className="w-5 h-5" />
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">
            About Me (App Features)
          </h3>
        </div>
        {isAdmin ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Write down all the features of this app step by step. Both Bangla and English are supported. This content will be publicly viewable by all clients.
            </p>
            <textarea
              value={aboutMeTextInput}
              onChange={(e) => setAboutMeTextInput(e.target.value)}
              placeholder="Write your app features here..."
              rows={12}
              className="w-full px-3 py-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
            />
            <div className="flex justify-end">
              <button 
                onClick={handleUpdateIdentity}
                disabled={savingIdentity}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {savingIdentity ? "Saving..." : "Save About Me"}
              </button>
            </div>
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed mt-2">
            {appSettings?.aboutMeText ? (
              <span>{appSettings.aboutMeText}</span>
            ) : (
              <>
                <p className="font-bold mb-2">অ্যাপের বৈশিষ্ট্যসমূহ (Features):</p>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                  <li>📇 <strong>কন্টাক্ট ম্যানেজমেন্ট (Contact Management):</strong> নতুন কন্টাক্ট যোগ করুন এবং ক্যাটাগরি (পরিবার, বন্ধু, অফিস) অনুযায়ী সহজেই সাজান।</li>
                  <li>🏷️ <strong>ট্যাগ এবং সার্কেল (Tags & Circles):</strong> কাস্টম ট্যাগ ব্যবহার করে নির্দিষ্ট মানুষদের সহজেই গ্রুপ করুন এবং খুঁজে বের করুন।</li>
                  <li>📝 <strong>নোট এবং ইন্টারঅ্যাকশন (Notes & Interactions):</strong> প্রতিটি মানুষের সাথে আপনার মিটিং, কল বা মেসেজের বিস্তারিত তথ্য সেভ করে রাখুন।</li>
                  <li>🔔 <strong>রিমাইন্ডার (Reminders):</strong> গুরুত্বপূর্ণ ফলো-আপ বা জন্মদিনের নোটিফিকেশন পান।</li>
                  <li>📊 <strong>ড্যাশবোর্ড (Dashboard):</strong> আপনার পুরো নেটওয়ার্কের একটি কুইক ওভারভিউ দেখুন।</li>
                  <li>🎨 <strong>কাস্টম থিম (Custom Themes):</strong> নিজের পছন্দমতো অ্যাপের কালার থিম পরিবর্তন করুন।</li>
                </ul>
                <p className="font-bold mb-2">কীভাবে ব্যবহার করবেন (Step by step instructions):</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li><strong>ড্যাশবোর্ড (Dashboard):</strong> অ্যাপটি ওপেন করলেই ড্যাশবোর্ডে আপনি আপনার কন্টাক্ট এবং সাম্প্রতিক অ্যাক্টিভিটির ওভারভিউ দেখতে পাবেন।</li>
                  <li><strong>নতুন কন্টাক্ট যোগ করা:</strong> নিচে থাকা "People" ট্যাবে গিয়ে "+" বাটনে ক্লিক করে নতুন কন্টাক্টের নাম, ফোন নম্বর, ইমেইল এবং অন্যান্য তথ্য যোগ করুন।</li>
                  <li><strong>ইন্টারঅ্যাকশন লগ করা:</strong> যেকোনো কন্টাক্টের প্রোফাইলে ঢুকে "Log Interaction" বাটনে ক্লিক করে আপনাদের সর্বশেষ কথা বা মিটিংয়ের বিবরণ লিখে রাখুন।</li>
                  <li><strong>সাজিয়ে রাখা:</strong> "Tags" ট্যাবে গিয়ে আপনার প্রয়োজন অনুযায়ী নতুন ট্যাগ তৈরি করুন (যেমন- "VIP", "School Friends") এবং কন্টাক্টদের সেই অনুযায়ী যুক্ত করুন।</li>
                  <li><strong>ফলো-আপ:</strong> "Dashboard" অথবা প্রোফাইলের রিমাইন্ডার সেকশন থেকে নিয়মিত ফলো-আপ করার আপডেট রাখুন।</li>
                  <li><strong>সেটিংস (Settings):</strong> এই পেজ থেকে আপনি থিম কালার বদলাতে পারবেন এবং অ্যাপের অন্যান্য কনফিগারেশন সেট করতে পারবেন।</li>
                </ol>
              </>
            )}
          </div>
        )}
      </div>`;

const replaceStr = `      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <button 
          onClick={() => setIsAboutMeOpen(!isAboutMeOpen)}
          className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
        >
          <div className="flex items-center gap-2 text-primary-600 dark:text-primary-500">
            <Info className="w-5 h-5" />
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              About Me (App Features)
            </h3>
          </div>
          {isAboutMeOpen ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </button>
        {isAboutMeOpen && (
          <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800 mt-2 space-y-4">
            {isAdmin ? (
              <div className="space-y-4 mt-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Write down all the features of this app step by step. Both Bangla and English are supported. This content will be publicly viewable by all clients.
                </p>
                <textarea
                  value={aboutMeTextInput}
                  onChange={(e) => setAboutMeTextInput(e.target.value)}
                  placeholder="Write your app features here..."
                  rows={12}
                  className="w-full px-3 py-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                />
                <div className="flex justify-end">
                  <button 
                    onClick={handleUpdateIdentity}
                    disabled={savingIdentity}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    {savingIdentity ? "Saving..." : "Save About Me"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed mt-4">
                {appSettings?.aboutMeText ? (
                  <span>{appSettings.aboutMeText}</span>
                ) : (
                  <>
                    <p className="font-bold mb-2">অ্যাপের বৈশিষ্ট্যসমূহ (Features):</p>
                    <ul className="list-disc pl-5 mb-4 space-y-1">
                      <li>📇 <strong>কন্টাক্ট ম্যানেজমেন্ট (Contact Management):</strong> নতুন কন্টাক্ট যোগ করুন এবং ক্যাটাগরি (পরিবার, বন্ধু, অফিস) অনুযায়ী সহজেই সাজান।</li>
                      <li>🏷️ <strong>ট্যাগ এবং সার্কেল (Tags & Circles):</strong> কাস্টম ট্যাগ ব্যবহার করে নির্দিষ্ট মানুষদের সহজেই গ্রুপ করুন এবং খুঁজে বের করুন।</li>
                      <li>📝 <strong>নোট এবং ইন্টারঅ্যাকশন (Notes & Interactions):</strong> প্রতিটি মানুষের সাথে আপনার মিটিং, কল বা মেসেজের বিস্তারিত তথ্য সেভ করে রাখুন।</li>
                      <li>🔔 <strong>রিমাইন্ডার (Reminders):</strong> গুরুত্বপূর্ণ ফলো-আপ বা জন্মদিনের নোটিফিকেশন পান।</li>
                      <li>📊 <strong>ড্যাশবোর্ড (Dashboard):</strong> আপনার পুরো নেটওয়ার্কের একটি কুইক ওভারভিউ দেখুন।</li>
                      <li>🎨 <strong>কাস্টম থিম (Custom Themes):</strong> নিজের পছন্দমতো অ্যাপের কালার থিম পরিবর্তন করুন।</li>
                    </ul>
                    <p className="font-bold mb-2">কীভাবে ব্যবহার করবেন (Step by step instructions):</p>
                    <ol className="list-decimal pl-5 space-y-1">
                      <li><strong>ড্যাশবোর্ড (Dashboard):</strong> অ্যাপটি ওপেন করলেই ড্যাশবোর্ডে আপনি আপনার কন্টাক্ট এবং সাম্প্রতিক অ্যাক্টিভিটির ওভারভিউ দেখতে পাবেন।</li>
                      <li><strong>নতুন কন্টাক্ট যোগ করা:</strong> নিচে থাকা "People" ট্যাবে গিয়ে "+" বাটনে ক্লিক করে নতুন কন্টাক্টের নাম, ফোন নম্বর, ইমেইল এবং অন্যান্য তথ্য যোগ করুন।</li>
                      <li><strong>ইন্টারঅ্যাকশন লগ করা:</strong> যেকোনো কন্টাক্টের প্রোফাইলে ঢুকে "Log Interaction" বাটনে ক্লিক করে আপনাদের সর্বশেষ কথা বা মিটিংয়ের বিবরণ লিখে রাখুন।</li>
                      <li><strong>সাজিয়ে রাখা:</strong> "Tags" ট্যাবে গিয়ে আপনার প্রয়োজন অনুযায়ী নতুন ট্যাগ তৈরি করুন (যেমন- "VIP", "School Friends") এবং কন্টাক্টদের সেই অনুযায়ী যুক্ত করুন।</li>
                      <li><strong>ফলো-আপ:</strong> "Dashboard" অথবা প্রোফাইলের রিমাইন্ডার সেকশন থেকে নিয়মিত ফলো-আপ করার আপডেট রাখুন।</li>
                      <li><strong>সেটিংস (Settings):</strong> এই পেজ থেকে আপনি থিম কালার বদলাতে পারবেন এবং অ্যাপের অন্যান্য কনফিগারেশন সেট করতে পারবেন।</li>
                    </ol>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>`;

if (code.includes(targetStr)) {
    fs.writeFileSync(path, code.replace(targetStr, replaceStr));
    console.log("Success");
} else {
    console.log("Failed to find target string. Check whitespace.");
}
