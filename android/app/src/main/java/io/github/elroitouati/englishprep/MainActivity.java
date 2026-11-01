package io.github.elroitouati.englishprep;

import android.app.Activity;
import android.content.Intent;
import android.content.res.Configuration;
import android.net.Uri;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.util.Locale;

// האפליקציה פותחת את אתר ההכנה למבחן בחלון מלא. התוכן נטען מהאתר, כך שכל עדכון באתר מגיע לאפליקציה בלי APK חדש.
public class MainActivity extends Activity {
    private static final String START_URL = "https://elroitouati.github.io/English-test/index.html#home";
    private static final String HOST = "elroitouati.github.io";
    private static final String PATH_PREFIX = "/English-test";

    private WebView web;
    private TextToSpeech tts;
    private volatile boolean ttsReady = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        web = new WebView(this);
        boolean night = (getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES;
        web.setBackgroundColor(night ? 0xFF131012 : 0xFFF7F3EE);
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setTextZoom(100);

        tts = new TextToSpeech(this, status -> ttsReady = status == TextToSpeech.SUCCESS);
        web.addJavascriptInterface(new TtsBridge(), "AndroidTTS");

        web.setWebViewClient(new AppWebClient(night));

        if (savedInstanceState != null) web.restoreState(savedInstanceState);
        else web.loadUrl(START_URL);
    }

    private static String offlinePage(boolean night) {
        String bg = night ? "#131012" : "#F7F3EE";
        String fg = night ? "#F4EEEE" : "#1E1717";
        return "<!doctype html><html lang='he' dir='rtl'><head><meta name='viewport' content='width=device-width,initial-scale=1'>"
            + "<style>body{margin:0;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;"
            + "font-family:system-ui,sans-serif;background:" + bg + ";color:" + fg + ";text-align:center;padding:24px;box-sizing:border-box}"
            + "h1{font-size:22px;margin:0}p{margin:0;opacity:.7}button{margin-top:12px;font:inherit;font-weight:600;font-size:17px;"
            + "background:#C8202F;color:#fff;border:0;border-radius:12px;padding:14px 28px}</style></head><body>"
            + "<h1>אין חיבור לאינטרנט</h1><p>בפעם הראשונה צריך חיבור כדי לטעון את האפליקציה.</p>"
            + "<button onclick=\"location.href='" + START_URL + "'\">לנסות שוב</button></body></html>";
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        web.saveState(outState);
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        // קודם נותנים לאתר לסגור תרגול פתוח; אחרת חוזרים אחורה בהיסטוריה; אחרת יוצאים
        web.evaluateJavascript("(window.appBack && window.appBack()) ? 'handled' : ''", result -> {
            if (result != null && result.contains("handled")) return;
            if (web.canGoBack()) web.goBack();
            else MainActivity.super.onBackPressed();
        });
    }

    @Override
    protected void onDestroy() {
        if (tts != null) tts.shutdown();
        if (web != null) web.destroy();
        super.onDestroy();
    }

    private class AppWebClient extends WebViewClient {
        private final boolean night;

        AppWebClient(boolean night) {
            this.night = night;
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            Uri uri = request.getUrl();
            String path = uri.getPath() == null ? "" : uri.getPath();
            if (HOST.equals(uri.getHost()) && path.startsWith(PATH_PREFIX)) return false;
            try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); } catch (Exception ignored) { }
            return true;
        }

        @Override
        public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
            if (request.isForMainFrame()) {
                view.loadDataWithBaseURL(null, offlinePage(night), "text/html", "utf-8", null);
            }
        }
    }

    private class TtsBridge {
        @JavascriptInterface
        public boolean isReady() {
            return ttsReady;
        }

        @JavascriptInterface
        public void speak(String text, String lang) {
            runOnUiThread(() -> {
                if (!ttsReady || text == null) return;
                tts.setLanguage(Locale.forLanguageTag(lang == null ? "en-US" : lang));
                tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "word");
            });
        }
    }
}
