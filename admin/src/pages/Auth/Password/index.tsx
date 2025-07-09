import React from 'react';
import { PasswordModel } from './models/page';
import ModifyForm from './views/Form';

export default function Password() {
  return (
    <PasswordModel.Provider>
      <ModifyForm />
    </PasswordModel.Provider>
  );
}
