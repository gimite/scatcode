import { Children, useEffect } from 'react';
import { getScatcodeRunsFromScatcodeText, registerCopyHandler } from 'scatcode-core';

// ScatcodeText component
export function ScatcodeText({ children }) {
  useEffect(() => {
    registerCopyHandler();
  }, []);

  const childArray = Children.toArray(children);
  for (const c of childArray) {
    if (typeof c !== 'string' && typeof c !== 'number') {
      throw new Error('ScatcodeText: children must be plain text (string or number)');
    }
  }
  const text = childArray.length === 0 ? '' : childArray.map(c => String(c)).join('');

  // Use the shared parser to obtain runs of {domain, text}
  const runs = getScatcodeRunsFromScatcodeText(text);
  const elements = runs.map((run, index) => {
    const style = run.domain && run.domain !== '' ? {fontFamily: run.domain.replace(/\./g, ' ')} : {};
    return <span key={index} style={style}>{run.text}</span>;
  });

  return <>{elements}</>;
}
