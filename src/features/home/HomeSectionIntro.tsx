type HomeSectionIntroProps = {
  id: string;
  kicker: string;
  title: string;
  intro: string;
};

export function HomeSectionIntro({ id, kicker, title, intro }: HomeSectionIntroProps) {
  return (
    <div className="home-section-intro">
      <p className="home-kicker">{kicker}</p>
      <h2 id={id}>{title}</h2>
      <p>{intro}</p>
    </div>
  );
}
