const fs = require('fs');

const path = 'src/components/SettingsView.tsx';
let code = fs.readFileSync(path, 'utf-8');

const regex = /const \[aboutMeTextInput, setAboutMeTextInput\] = useState\(appSettings\?\.aboutMeText \|\| `([\s\S]*?)`\);/g;

const replacement = `const defaultBnText = \`**অ্যাপের বৈশিষ্ট্যসমূহ (Features):**
📇 **কন্টাক্ট ম্যানেজমেন্ট (Contact Management):** নতুন কন্টাক্ট যোগ করুন এবং ক্যাটাগরি (পরিবার, বন্ধু, অফিস) অনুযায়ী সহজেই সাজান।
🏷️ **ট্যাগ এবং সার্কেল (Tags & Circles):** কাস্টম ট্যাগ ব্যবহার করে নির্দিষ্ট মানুষদের সহজেই গ্রুপ করুন এবং খুঁজে বের করুন।
📝 **নোট এবং ইন্টারঅ্যাকশন (Notes & Interactions):** প্রতিটি মানুষের সাথে আপনার মিটিং, কল বা মেসেজের বিস্তারিত তথ্য সেভ করে রাখুন।
🔔 **রিমাইন্ডার (Reminders):** গুরুত্বপূর্ণ ফলো-আপ বা জন্মদিনের নোটিফিকেশন পান।
📊 **ড্যাশবোর্ড (Dashboard):** আপনার পুরো নেটওয়ার্কের একটি কুইক ওভারভিউ দেখুন।
🎨 **কাস্টম থিম (Custom Themes):** নিজের পছন্দমতো অ্যাপের কালার থিম পরিবর্তন করুন।

**কীভাবে ব্যবহার করবেন (Step by step instructions):**
১. **ড্যাশবোর্ড (Dashboard):** অ্যাপটি ওপেন করলেই ড্যাশবোর্ডে আপনি আপনার কন্টাক্ট এবং সাম্প্রতিক অ্যাক্টিভিটির ওভারভিউ দেখতে পাবেন।
২. **নতুন কন্টাক্ট যোগ করা:** নিচে থাকা "People" ট্যাবে গিয়ে "+" বাটনে ক্লিক করে নতুন কন্টাক্টের নাম, ফোন নম্বর, ইমেইল এবং অন্যান্য তথ্য যোগ করুন।
৩. **ইন্টারঅ্যাকশন লগ করা:** যেকোনো কন্টাক্টের প্রোফাইলে ঢুকে "Log Interaction" বাটনে ক্লিক করে আপনাদের সর্বশেষ কথা বা মিটিংয়ের বিবরণ লিখে রাখুন।
৪. **সাজিয়ে রাখা:** "Tags" ট্যাবে গিয়ে আপনার প্রয়োজন অনুযায়ী নতুন ট্যাগ তৈরি করুন (যেমন- "VIP", "School Friends") এবং কন্টাক্টদের সেই অনুযায়ী যুক্ত করুন।
৫. **ফলো-আপ:** "Dashboard" অথবা প্রোফাইলের রিমাইন্ডার সেকশন থেকে নিয়মিত ফলো-আপ করার আপডেট রাখুন।
৬. **সেটিংস (Settings):** এই পেজ থেকে আপনি থিম কালার বদলাতে পারবেন এবং অ্যাপের অন্যান্য কনফিগারেশন সেট করতে পারবেন।\`;

const defaultEnText = \`**App Features:**
📇 **Contact Management:** Add new contacts and organize them easily by category (Family, Friends, Office).
🏷️ **Tags & Circles:** Easily group and find specific people using custom tags.
📝 **Notes & Interactions:** Save detailed information of your meetings, calls or messages with each person.
🔔 **Reminders:** Get important follow-up or birthday notifications.
📊 **Dashboard:** View a quick overview of your entire network.
🎨 **Custom Themes:** Change the color theme of the app to your liking.

**How to use (Step by step instructions):**
1. **Dashboard:** As soon as you open the app, you will see an overview of your contacts and recent activities on the dashboard.
2. **Adding new contacts:** Go to the "People" tab below and click the "+" button to add the name, phone number, email and other information of the new contact.
3. **Logging Interactions:** Enter any contact's profile and click the "Log Interaction" button to write down the details of your latest conversation or meeting.
4. **Organizing:** Go to the "Tags" tab and create new tags according to your needs (eg- "VIP", "School Friends") and add contacts accordingly.
5. **Follow-up:** Keep regular follow-up updates from the "Dashboard" or profile reminder section.
6. **Settings:** From this page you can change the theme color and set other configurations of the app.\`;

  const [aboutMeTextInput, setAboutMeTextInput] = useState(appSettings?.aboutMeText || (lang === 'bn' ? defaultBnText : defaultEnText));`;

code = code.replace(regex, replacement);

const regex2 = /setAboutMeTextInput\(appSettings\?\.aboutMeText \|\| `([\s\S]*?)`\);/g;
code = code.replace(regex2, "setAboutMeTextInput(appSettings?.aboutMeText || (lang === 'bn' ? defaultBnText : defaultEnText));");

const targetRenderStr = `<p className="font-bold mb-2">অ্যাপের বৈশিষ্ট্যসমূহ (Features):</p>
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
                    </ol>`;

const replaceRenderStr = `lang === 'bn' ? (
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
                    ) : (
                      <>
                        <p className="font-bold mb-2">App Features:</p>
                        <ul className="list-disc pl-5 mb-4 space-y-1">
                          <li>📇 <strong>Contact Management:</strong> Add new contacts and organize them easily by category (Family, Friends, Office).</li>
                          <li>🏷️ <strong>Tags & Circles:</strong> Easily group and find specific people using custom tags.</li>
                          <li>📝 <strong>Notes & Interactions:</strong> Save detailed information of your meetings, calls or messages with each person.</li>
                          <li>🔔 <strong>Reminders:</strong> Get important follow-up or birthday notifications.</li>
                          <li>📊 <strong>Dashboard:</strong> View a quick overview of your entire network.</li>
                          <li>🎨 <strong>Custom Themes:</strong> Change the color theme of the app to your liking.</li>
                        </ul>
                        <p className="font-bold mb-2">How to use (Step by step instructions):</p>
                        <ol className="list-decimal pl-5 space-y-1">
                          <li><strong>Dashboard:</strong> As soon as you open the app, you will see an overview of your contacts and recent activities on the dashboard.</li>
                          <li><strong>Adding new contacts:</strong> Go to the "People" tab below and click the "+" button to add the name, phone number, email and other information of the new contact.</li>
                          <li><strong>Logging Interactions:</strong> Enter any contact's profile and click the "Log Interaction" button to write down the details of your latest conversation or meeting.</li>
                          <li><strong>Organizing:</strong> Go to the "Tags" tab and create new tags according to your needs (eg- "VIP", "School Friends") and add contacts accordingly.</li>
                          <li><strong>Follow-up:</strong> Keep regular follow-up updates from the "Dashboard" or profile reminder section.</li>
                          <li><strong>Settings:</strong> From this page you can change the theme color and set other configurations of the app.</li>
                        </ol>
                      </>
                    )`;

if (code.includes(targetRenderStr)) {
  code = code.replace(targetRenderStr, replaceRenderStr);
  fs.writeFileSync(path, code);
  console.log('Success');
} else {
  console.log('Failed to find targetRenderStr in file. Proceeding with manual check.');
}
