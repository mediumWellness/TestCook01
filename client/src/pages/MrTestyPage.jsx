import { useMemo, useState } from 'react';

const defaultConfig = {
  personaName: 'Mr Testy',
  targetExperience: 'browser-based games and roleplay chatbots',
  sessionHours: '8',
  playStyle: 'curious, persistent, and in-character',
  primaryGoal: 'stress-test progression loops, roleplay branches, and boredom points',
  roleplayFocus:
    'Stay in persona, react naturally to prompts, and keep exploring the same world without rushing to the end.',
  reportingFocus:
    'Flag confusion, repetition, dead ends, missing feedback, balance spikes, and places where the fantasy breaks.',
};

export default function MrTestyPage() {
  const [config, setConfig] = useState(defaultConfig);

  const plan = useMemo(() => {
    const sessionHours = Number(config.sessionHours) > 0 ? Number(config.sessionHours) : 1;

    return `You are ${config.personaName}, a browser persona agent for ${config.targetExperience}.

Core behavior:
- Play with a ${config.playStyle} style.
- Stay active for up to ${sessionHours} hour${sessionHours === 1 ? '' : 's'} per session.
- Primary goal: ${config.primaryGoal}
- Roleplay focus: ${config.roleplayFocus}
- Reporting focus: ${config.reportingFocus}

Session routine:
1. Start as a first-time player and note onboarding friction.
2. Keep exploring, retrying, and roleplaying instead of optimizing for a fast win.
3. Revisit earlier systems to catch long-session fatigue, repetition, and resource traps.
4. Record any soft locks, unclear goals, broken immersion, or missing responses.
5. End each session with a short summary covering fun moments, blockers, exploits, and next probes.

Output format:
- Session summary
- Bugs or blockers
- Roleplay quality notes
- Engagement and pacing notes
- Suggested follow-up scenarios`;
  }, [config]);

  function handleChange(event) {
    const { name, value } = event.target;
    setConfig((current) => ({ ...current, [name]: value }));
  }

  return (
    <div className="persona-page">
      <div className="page-header persona-page-header">
        <div>
          <h1>Mr Testy</h1>
          <p className="persona-intro">
            Build a browser persona brief for long-running game and roleplay chatbot testing.
          </p>
        </div>
      </div>

      <div className="persona-layout">
        <form className="recipe-form" onSubmit={(event) => event.preventDefault()}>
          <label>
            Persona name
            <input name="personaName" value={config.personaName} onChange={handleChange} />
          </label>

          <label>
            Target experience
            <input
              name="targetExperience"
              value={config.targetExperience}
              onChange={handleChange}
            />
          </label>

          <div className="form-row">
            <label>
              Session length (hours)
              <input
                type="number"
                min="1"
                name="sessionHours"
                value={config.sessionHours}
                onChange={handleChange}
              />
            </label>

            <label>
              Play style
              <input name="playStyle" value={config.playStyle} onChange={handleChange} />
            </label>
          </div>

          <label>
            Primary goal
            <textarea
              name="primaryGoal"
              value={config.primaryGoal}
              onChange={handleChange}
              rows={3}
            />
          </label>

          <label>
            Roleplay focus
            <textarea
              name="roleplayFocus"
              value={config.roleplayFocus}
              onChange={handleChange}
              rows={4}
            />
          </label>

          <label>
            Reporting focus
            <textarea
              name="reportingFocus"
              value={config.reportingFocus}
              onChange={handleChange}
              rows={4}
            />
          </label>
        </form>

        <section className="persona-plan" aria-labelledby="persona-plan-heading">
          <div className="persona-plan-header">
            <h2 id="persona-plan-heading">Generated agent brief</h2>
            <p>Copy this prompt into a browser automation or agent workflow.</p>
          </div>
          <textarea className="persona-plan-output" value={plan} readOnly rows={20} />
        </section>
      </div>
    </div>
  );
}
