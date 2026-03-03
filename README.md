Rough README

How to build and run:
1. install dependencies
    npm install -g typescript
    npm install -g http-server
2. build
    python make-menger.py
3. Run the server
    http-server dist -c-1
4. Open browser to: http://127.0.0.1:8080

Initial test results:
- Menger isDirty/setClean: PASSED
- Menger approximate positions/normals/indices: PASSED
- Testing setLevel(n) in App.ts
- Level 0: 36 indices (1 cube) - verified
- Level 1: 720 indices (20 cubes) - verified
- Level 2: 14,400 indices (400 cubes) - verified
- Level 3: 288,000 indices (8,000 cubes) - verified