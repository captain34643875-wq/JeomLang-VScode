# JEOM VS Code Runner

VS Code에서 점랭(`.jeom`) 파일을 바로 실행하기 위한 비공식 보조 프로젝트입니다.

원본 점랭 프로젝트:

- Website: https://jeomlang.vercel.app/
- GitHub: https://github.com/minirang/jeomlang

이 저장소의 목적은 점랭 언어 자체를 소유하거나 배포하는 것이 아니라, VS Code에서 `.jeom` 파일을 Python/C처럼 버튼으로 실행할 수 있게 만드는 것입니다.

## 기능

- `.jeom` 파일 언어 인식
- 기본 문법 하이라이트
- 기본 스니펫
- `Ctrl + Shift + B`로 현재 `.jeom` 파일 실행
- 에디터 오른쪽 위 Run 버튼으로 실행
- 파일 상단 `Run JEOM` / `Check JEOM` CodeLens
- 우클릭 메뉴와 명령 팔레트 실행
- Windows PowerShell 기준 실행

## 실행 명령

현재 열린 `.jeom` 파일을 아래 명령으로 실행합니다.

```powershell
node jeom_cli.js run <현재 .jeom 파일>
```

## Ctrl + Shift + B로 실행

1. VS Code에서 이 폴더를 엽니다.
2. 실행할 `.jeom` 파일을 엽니다.
3. `Ctrl + Shift + B`를 누릅니다.
4. `JEOM: Run Current File` 작업이 실행됩니다.

## Run 버튼으로 실행

Run 버튼과 문법 하이라이트는 VS Code 확장 기능입니다. 현재 VS Code 창에 확장으로 설치되어야 Python처럼 에디터 오른쪽 위 실행 버튼이 나타납니다.

### 권장: 로컬 확장으로 설치

PowerShell에서 아래 명령을 실행합니다.

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-local-extension.ps1
```

그 다음 VS Code를 `Developer: Reload Window`로 다시 불러오거나 완전히 껐다 켭니다. 이후 `.jeom` 파일을 열면 다음이 나타납니다.

- 파일 언어 모드: `JEOM`
- 문법 하이라이트
- 파일 상단 `Run JEOM` / `Check JEOM`
- 에디터 오른쪽 위 재생 버튼

### 개발 모드: F5로 실행

1. 이 저장소를 VS Code로 엽니다.
2. `F5`를 눌러 `Run JEOM VS Code Extension`을 실행합니다.
3. 새로 열린 Extension Development Host 창에서 `.jeom` 파일을 엽니다.
4. 에디터 오른쪽 위 재생 버튼, `Run JEOM` CodeLens, 또는 `Ctrl + F5`로 실행합니다.

F5가 잘 안 되면 위의 로컬 설치 방식을 쓰는 편이 더 안정적입니다. 일반 VS Code 창에서 `Ctrl + F5`가 Node 디버거 실행으로 잡히면 `Debugger attached` 같은 문구와 긴 `NODE_OPTIONS` 명령이 출력될 수 있습니다. 깨끗하게 실행하려면 확장이 설치된 상태에서 `.jeom` 파일의 Run 버튼이나 `Run JEOM` CodeLens를 사용하세요.

확장으로 실행할 때는 `.jeom` 파일이 이 저장소 밖에 있어도 됩니다. 기본적으로 확장 폴더 안의 `jeom_cli.js`를 사용하고, 현재 워크스페이스에 `jeom_cli.js`가 있으면 그 파일을 우선 사용합니다.

## CLI 경로 직접 지정

다른 위치의 점랭 CLI를 쓰고 싶다면 VS Code 설정에서 `jeom.cliPath`를 지정하면 됩니다.

예:

```json
{
  "jeom.cliPath": "${workspaceFolder}\\jeom_cli.js"
}
```

## 포함된 파일

- `.vscode/tasks.json`: 현재 열린 `.jeom` 파일 실행, `Ctrl + Shift + B` 기본 작업
- `.vscode/settings.json`: `*.jeom` 파일 연결 및 Code Runner 확장 실행 명령
- `.vscode/launch.json`: 확장 개발 호스트 실행 구성
- `.vscode/jeom.code-snippets`: 워크스페이스 스니펫
- `extension.js`: Run 버튼, CodeLens, 우클릭 메뉴, 명령 팔레트 실행 기능
- `scripts/install-local-extension.ps1`: 현재 확장을 로컬 VS Code 확장 폴더에 설치
- `syntaxes/jeom.tmLanguage.json`: 기본 TextMate 문법 하이라이트 정의
- `language-configuration.json`: 주석, 괄호, 자동 닫기 설정
- `assets/jeom-icon.svg`: JEOM 파일 아이콘
- `package.json`: VS Code 확장 메타데이터

## 참고

점랭 언어 사양과 예제는 원본 사이트와 원본 GitHub 저장소를 기준으로 확인하세요. 이 저장소는 VS Code 실행 환경을 붙이는 용도입니다.

## GitHub Actions 봇 커밋 데모

`github-actions[bot]` 커밋을 테스트하려면 GitHub 저장소의 Actions 탭에서 `Actions Bot Demo` 워크플로를 수동 실행하면 됩니다.

실행하면 GitHub 서버에서 `ACTIONS_BOT_DEMO.md`를 갱신하고, `github-actions[bot]` author로 커밋합니다.
