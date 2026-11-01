#!/bin/bash
# Builds and signs download/english-prep.apk with the Android SDK command-line tools (no Gradle needed).
# Needs: ANDROID_HOME with platforms;android-34 and build-tools;35.0.0, a JDK, and android/keystore.properties
# pointing to the signing key (kept out of git). The same key must be reused so the app can update in place.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/android"
SDK="${ANDROID_HOME:-/opt/android-sdk}"
BT="$SDK/build-tools/35.0.0"
AJ="$SDK/platforms/android-34/android.jar"
OUT="$SRC/build/apk"
rm -rf "$OUT"; mkdir -p "$OUT/gen" "$OUT/classes" "$OUT/dex"

sed 's|<manifest xmlns:android="http://schemas.android.com/apk/res/android">|<manifest xmlns:android="http://schemas.android.com/apk/res/android" package="io.github.elroitouati.englishprep">|' \
  "$SRC/app/src/main/AndroidManifest.xml" > "$OUT/AndroidManifest.xml"
"$BT/aapt2" compile --dir "$SRC/app/src/main/res" -o "$OUT/res.zip"
"$BT/aapt2" link -o "$OUT/unsigned.apk" -I "$AJ" --manifest "$OUT/AndroidManifest.xml" --java "$OUT/gen" "$OUT/res.zip" \
  --min-sdk-version 24 --target-sdk-version 34 --version-code 1 --version-name 1.0
javac -nowarn --release 11 -classpath "$AJ" -d "$OUT/classes" $(find "$SRC/app/src/main/java" "$OUT/gen" -name '*.java')
"$BT/d8" --release --lib "$AJ" --min-api 24 --output "$OUT/dex" $(find "$OUT/classes" -name '*.class')
cp "$OUT/unsigned.apk" "$OUT/with-dex.apk"
python3 -c "import zipfile,sys; z=zipfile.ZipFile(sys.argv[1],'a'); z.write(sys.argv[2],'classes.dex'); z.close()" "$OUT/with-dex.apk" "$OUT/dex/classes.dex"
"$BT/zipalign" -f -p 4 "$OUT/with-dex.apk" "$OUT/aligned.apk"
PASS=$(grep storePassword "$SRC/keystore.properties" | cut -d= -f2)
"$BT/apksigner" sign --ks "$SRC/$(grep storeFile "$SRC/keystore.properties" | cut -d= -f2)" --ks-key-alias englishprep \
  --ks-pass "pass:$PASS" --key-pass "pass:$PASS" --out "$ROOT/download/english-prep.apk" "$OUT/aligned.apk"
"$BT/apksigner" verify "$ROOT/download/english-prep.apk" && echo "Built $ROOT/download/english-prep.apk"
