import { useMemo, useState } from 'react';

const defaultConfig = {
  model: '',
  firmware: '',
  goal: '',
  environment: '',
  baseline: '',
  constraints: '',
  successCriteria: '',
};

export default function DQProPage() {
  const [config, setConfig] = useState(defaultConfig);

  const profile = useMemo(
    () => `You are an optimization assistant for the DQ-Pro device.

Device context:
- Exact model or variant: ${config.model || '[provide exact model or variant]'}
- Firmware or software version: ${config.firmware || '[provide version, if applicable]'}
- Operating environment: ${config.environment || '[describe the environment and connected equipment]'}
- Current configuration and measured baseline: ${config.baseline || '[record current settings and baseline measurements]'}
- Optimization goal: ${config.goal || '[describe the specific goal]'}
- Constraints: ${config.constraints || '[list safety, compatibility, budget, and downtime constraints]'}
- Success criteria: ${config.successCriteria || '[define measurable results and acceptable trade-offs]'}

Optimization process:
1. Confirm the exact device variant and use its manufacturer documentation; do not assume undocumented controls, specifications, or compatibility.
2. Identify missing information and ask for it before suggesting device-specific settings.
3. Establish and preserve a repeatable baseline using the stated success criteria.
4. Recommend only supported, reversible changes. Explain the expected benefit, trade-offs, and verification method for each.
5. Change one variable at a time, measure the result under comparable conditions, and keep a change log.
6. Stop if a change could exceed documented operating limits or conflict with a stated constraint; provide rollback steps for every proposed change.

Output:
- Confirmed device context and assumptions
- Baseline and measurable target
- Ordered, reversible optimization steps
- Validation measurements and comparison method
- Risks, trade-offs, and rollback steps
- Open questions and follow-up measurements`,
    [config],
  );

  function handleChange(event) {
    const { name, value } = event.target;
    setConfig((current) => ({ ...current, [name]: value }));
  }

  return (
    <div className="persona-page">
      <div className="page-header persona-page-header">
        <div>
          <h1>DQ-Pro Optimization</h1>
          <p className="persona-intro">
            Build a reusable, measurement-based profile for optimizing a DQ-Pro device.
            Identify the exact model and constraints before applying device-specific changes.
          </p>
        </div>
      </div>

      <div className="persona-layout">
        <form className="persona-form recipe-form" onSubmit={(event) => event.preventDefault()}>
          <label>
            Exact model or variant
            <input
              name="model"
              value={config.model}
              onChange={handleChange}
              placeholder="Check the device label or manual"
            />
          </label>

          <label>
            Firmware or software version
            <input
              name="firmware"
              value={config.firmware}
              onChange={handleChange}
              placeholder="If applicable"
            />
          </label>

          <label>
            Optimization goal
            <textarea
              name="goal"
              value={config.goal}
              onChange={handleChange}
              rows={3}
              placeholder="For example: improve throughput while maintaining reliability"
            />
          </label>

          <label>
            Operating environment and connected equipment
            <textarea
              name="environment"
              value={config.environment}
              onChange={handleChange}
              rows={3}
            />
          </label>

          <label>
            Current configuration and baseline measurements
            <textarea
              name="baseline"
              value={config.baseline}
              onChange={handleChange}
              rows={4}
            />
          </label>

          <label>
            Constraints and acceptable trade-offs
            <textarea
              name="constraints"
              value={config.constraints}
              onChange={handleChange}
              rows={3}
              placeholder="Include safety, compatibility, budget, and downtime limits"
            />
          </label>

          <label>
            Measurable success criteria
            <textarea
              name="successCriteria"
              value={config.successCriteria}
              onChange={handleChange}
              rows={3}
            />
          </label>
        </form>

        <section className="persona-plan" aria-labelledby="dqpro-profile-heading">
          <div className="persona-plan-header">
            <h2 id="dqpro-profile-heading">Generated optimization profile</h2>
            <p>Copy this profile into an assistant workflow to plan and track optimization.</p>
          </div>
          <textarea className="persona-plan-output" value={profile} readOnly rows={24} />
        </section>
      </div>
    </div>
  );
}
