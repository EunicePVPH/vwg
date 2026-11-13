import type { Routine, Settings } from './types';

/** Editable suggestions. Target times are placeholders until the teacher sets them. */
export const DEFAULT_ROUTINES: Routine[] = [
  {
    id: 'r_switch',
    title: 'Switching Subjects',
    icon: 'swap',
    steps: [
      'Put away previous subject materials.',
      'Take out materials for the next subject.',
      'Sit quietly and prepare.',
    ],
    targetSec: 120,
    cueEnabled: true,
    warnSec: 20,
  },
  {
    id: 'r_clean',
    title: 'Cleaning and Packing Up',
    icon: 'brush',
    steps: [
      'Organize learning materials.',
      'Return supplies to their places.',
      'Clean desk and area.',
      'Get ready for the next activity.',
    ],
    targetSec: 180,
    cueEnabled: true,
    warnSec: 30,
  },
  {
    id: 'r_recess',
    title: 'Returning and Settling Down After Recess',
    icon: 'sun',
    steps: [
      'Return to classroom.',
      'Put belongings away.',
      'Sit in assigned seat.',
      'Prepare for next lesson.',
    ],
    targetSec: 180,
    cueEnabled: true,
    warnSec: 30,
  },
  {
    id: 'r_groups',
    title: 'Forming Groups / Lining Up',
    icon: 'users',
    steps: [
      'Listen to the teacher.',
      'Move to assigned group/line.',
      'Organize yourselves.',
      'Wait for the next instruction.',
    ],
    targetSec: 120,
    cueEnabled: true,
    warnSec: 20,
  },
];

export const DEFAULT_SETTINGS: Settings = {
  schoolName: 'San Jose Central School',
  className: 'Grade 4',
  grade: '4',
  phase: 'baseline',
  posttestUse: 'unset',
  readinessType: 'percent',
  readinessValue: null,
  readinessConfirmed: false,
  soundOn: false,
  volume: 0.5,
  motion: 'system',
  demoMode: false,
  pairingRule: 'unset',
  pairingApproved: false,
  defaultTargetSec: 120,
};

export const cloneRoutines = (r: Routine[]): Routine[] => JSON.parse(JSON.stringify(r));
