export class Skill {
  [key: string]: any;

  constructor(
    public name: string,
    public category: 'primary' | 'secondary' | 'ultimate',
    public type: 'lethal' | 'non-lethal' | 'mixed' | 'mobility',
    public isDeployable: boolean,
    public isActive: boolean
  ) {}
}
// js에서는 다중 상속 개념이 없음.. 따라서 중복되는 클래스 하위 분류 필요함.
// 1차 분류: 기본기, 특기, 궁극기
// 2차 분류: 살상, 비살상(힐, 탱), 혼합(살상, 비살상)
// 3차 분류: 설치 유무
// 클래스의 상속으로 카테고리와 타입을 분류하기 보다는 카테고리 및 타입 자체를 클래스의 속성으로 두는 것이 더 바람직함.

// primary: bullets, maxBullets, power, point
