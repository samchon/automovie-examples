# 〈두 번째 손〉

## Current decision on the 3D film

The commissioning user watched the full round-four broadcast and rejected it. In playback the basketball felt about half to one-third real speed. Walking and running looked wrong, players lacked convincing footwork, and off-ball players rarely moved or competed. The 180-second film has been discarded. The commissioner directed the next production to start again from screenplay. Current work is forensic review only. [Withdrawal decision](docs/acceptance/two-hands.md#round-four-3d-film-rejected) · [Forensic review](docs/acceptance/two-hands-3d-review-forensics.md)

《슬램덩크》의 북산과 하마우라공고가 치르는 5대5 연습경기를 한국어 중계 대본 한 편으로 쓴다. 관객은 연속된 방송 180초 동안 공을 따라가면서 공 없는 선수의 움직임이 다음 득점 기회를 어떻게 만드는지 볼 수 있어야 한다.

## 납품 범위와 결정권

대본 제작 단계의 납품물은 완결 중계 대본과 제작 근거였다. 제작 근거에는 인물별 brief, 실제 사용한 조사와 출처, Evidence 답변, 독립 리뷰 결과와 감독의 최종 판독을 담는다. 이번 제작에서는 이 대본을 그대로 3D로 연출한다.

창작 결정권을 위임받은 의뢰인이 경기의 뼈대와 중계 형식에 합의했다. 세부 경기 전개, 시점, 카메라와 마지막 화면은 감독이 정한다. [감독 의뢰지시서](docs/instructions/commission.md)

## 집필과 판독

두 접수 파일의 저장 결과를 받은 뒤 감독이 작가를 배정한다. 정규 shorts 경로에 따라 요구사항을 한 차례 정리하고 brief와 대본 전편을 작성한다. 작가, Evidence 답변자, 독립 리뷰어는 각각 대화 이력을 상속하지 않는 별도의 Codex GPT-6.2 Astra High 서브에이전트다. 감독은 활성 단계의 Evidence 보고서 전문을 확인한다. 리뷰어는 주석 없는 원고를 먼저 읽고 판독을 기록한다. 작가는 수용한 지적을 원인별로 모아 수정하고, 감독은 최종본을 첫 송출 화면부터 마지막 화면까지 다시 읽는다. [단편 제작 순서](../../../.agents/skills/story/workflow/short.md)

모든 배정문에 Windows PowerShell 또는 pwsh만 사용하고 Bash, Git Bash, WSL을 호출하지 않는 규칙을 명시한다. 파일 변경은 이 작품 폴더 안으로 한정하며 Git 커밋과 푸시는 하지 않는다.

## 3D 중계 납품

승인 대본 SHA-256 `c54336360a8357bf240bc39f6425f4bce19e507e2cfac1f7b530e4c03677244c`를 180초짜리 직접 렌더 영화로 구현한다. 의뢰인은 화면 연출을 감독에게 위임했다. 1994년 체육관에서 높은 중앙 A가 경기를 따라가고, 동점 덩크의 같은 일곱 초만 낮은 엔드라인 B로 재생한다. 납품 규격은 1280×720, 초당 24프레임, 한국어 중계·체육관 효과음·한국어 선택 자막이다. 경기 시계는 후반 1:49에서 출발하고 작전시간과 투입 중에는 멈춘다. 로컬 AutoMovie 0.3.0으로 장면을 구성하고, 인코딩된 화면을 감독과 별도의 심사자가 확인한다.

직접 3D 제작에서 감독, 작가, 기술 연출, 음향, Evidence 답변자, 독립 심사자는 모두 Codex의 `gpt-6.2-sol` 모델과 `high` 추론 강도를 사용한다. 완성 영화에서 농구 경기나 인물의 반응이 읽히지 않으면 원인을 화면과 대본에서 함께 찾는다. 대본에 원인이 있으면 별도의 작가, Evidence 답변자, 독립 원고 심사자가 개정본을 검토하고 해당 구간을 다시 렌더한다.

The director adopted revised screenplay SHA-256 `c66a27fc5d26494e8ef3e0e994ad1a93d858da57a0f6d4ed538972dc08409d3e` after two picture reviews located a missing link in the bench exchange. The Sol High revision gives blue 7 and blue 4 one line each, makes blue 8's two screens visible in A, and uses the scorer's table as the common reference in the final possession. The 180-second running time, clock, score and replay follow the original plan. The original screenplay and its writing and review credits remain in the historical handoff. [Revised screenplay](docs/body/screenplay/two-hands/010-game.md) · [Original handoff](docs/acceptance/two-hands.md)
