export enum ValidationErrorType {
  GENERAL = 'General Validation Errors',
  ONLY_ADMIN_TO_ROOT = 'Only Admin will report to Root',
  MANAGER_REPORTING = 'Managers can only report to other managers or admin',
  CALLER_REPORTING = 'Caller can only report to manager',
  SINGLE_PARENT = 'All users will report to 1 parent user at a time',
}

export interface UserData {
  FullName: string;
  Email: string;
  Role: 'Root' | 'Admin' | 'Manager' | 'Caller';
  ReportsTo?: string;
}
export interface  ErrorType { 
  category: ValidationErrorType; 
  errors: string[]; 
}

export function validateFile(data: UserData[] ):  ErrorType[] {
  // Reset all state
  let userMap: Map<string, UserData> = new Map();

  const adminErrors: string[] = [];
  const managerErrors: string[] = [];
  const callerErrors: string[] = [];
  const multipleParentErrors: string[] = [];
  const generalErrors: string[] = [];

  // First pass: Build user map and validate Root user
  let rootCount = 0;
  let rootUser: UserData | null = null;
  
  // Create user map first
   data.forEach((row: UserData, index: number) => {
    const { Email, Role, FullName } = row;
    
    if (!Email || !Role) {
      generalErrors.push(`Row ${index + 1} contains missing required fields (Email: ${Email}, Role: ${Role})`);
      return;
    }
    
    if (Role === 'Root') {
      rootCount++;
      rootUser = row;
    }
     userMap.set(Email, { ...row});
  });

  // Validate root user existence
  if (rootCount === 0) {
    generalErrors.push('No Root user found in the data');
  } else if (rootCount > 1) {
    generalErrors.push(`Found ${rootCount} Root users. Only one Root user is allowed`);
  }

  // Second pass: Validate reporting structure
   data.forEach((row: UserData, index: number) => {
    const { Email, Role, ReportsTo, FullName } = row;
    const rowNum = index + 1;

    // Skip root user validation as they shouldn't report to anyone
    if (Role === 'Root') {
      if (ReportsTo) {
        generalErrors.push(
          `Row ${rowNum}  (${Email}) : Root user ${FullName} should not report to anyone`
        );
      }
      return;
    }

    // Validate ReportsTo field exists for non-root users
    if (!ReportsTo) {
      generalErrors.push(
        `Row ${rowNum}  (${Email}) : ${FullName} (${Role}) is missing ReportsTo field`
      );
      return;
    }

    const parents = ReportsTo.split(';').map(parent => parent.trim());

    // Validate single parent rule first
    if (parents.length > 1) {
      multipleParentErrors.push(
        `Row ${rowNum}  (${Email}) : ${FullName} reports to multiple parents (${ReportsTo})`
      );
      // Don't return here - continue validation for each parent
    }

    // Validate each parent relationship
    parents.forEach(parentEmail => {
      const parent =  userMap.get(parentEmail);

      // Validate parent exists
      if (!parent) {
        generalErrors.push(
          `Row ${rowNum}  (${Email}) : ${FullName} reports to non-existent user ${parentEmail}`
        );
        return;
      }

      // Role-specific validation
      switch (Role) {
        case 'Admin':
          if (parent.Role !== 'Root') {
            adminErrors.push(
              `Row ${rowNum}  (${Email}) : ${FullName} is an Admin but reports to ${parent.FullName} (${parent.Role}), not Root`
            );
          }
          break;

        case 'Manager':
          if (parent.Role === 'Root') {
            adminErrors.push(
              `Row ${rowNum}  (${Email}) : ${FullName} is a Manager but reports to Root (${parent.FullName})`
            );
          } else if (!['Admin', 'Manager'].includes(parent.Role)) {
            managerErrors.push(
              `Row ${rowNum}  (${Email}) : ${FullName} is a Manager but reports to ${parent.FullName} (${parent.Role})`
            );
          }
          break;

        case 'Caller':
          if (parent.Role !== 'Manager') {
            callerErrors.push(
              `Row ${rowNum}  (${Email}) : ${FullName} is a Caller but reports to ${parent.FullName} (${parent.Role})`
            );
          }
          break;
      }
    });
  });

  // Combine all errors and filter out empty categories
   let errors =  [
    { category: ValidationErrorType.GENERAL, errors: generalErrors },
    { category: ValidationErrorType.ONLY_ADMIN_TO_ROOT, errors: adminErrors },
    { category: ValidationErrorType.MANAGER_REPORTING, errors: managerErrors },
    { category: ValidationErrorType.CALLER_REPORTING, errors: callerErrors },
    { category: ValidationErrorType.SINGLE_PARENT, errors: multipleParentErrors },
  ].filter(category => category.errors.length > 0);
  console.log(errors,'errors');
  return errors;

}