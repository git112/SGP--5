/**
 * Email validation utilities for Charusat authentication
 */

/**
 * Validate Charusat email formats:
 * - Accept any email ending with @charusat.edu.in or @charusat.ac.in
 */
export const validateCharusatEmail = (email: string): boolean => {
  // General pattern: any email ending with @charusat.edu.in or @charusat.ac.in
  const generalPattern = /^.+@charusat\.(edu|ac)\.in$/;
  
  return generalPattern.test(email);
};

/**
 * Identify user type based on email structure
 * Returns: 'student', 'd2d_student', or 'faculty'
 */
export const getUserType = (email: string): 'student' | 'd2d_student' | 'faculty' | 'unknown' => {
  const studentPattern = /^(2[1-5])it\d{3}@charusat\.edu\.in$/;
  const d2dPattern = /^d(2[1-5])it\d{3}@charusat\.edu\.in$/;
  const facultyPattern = /^[a-zA-Z0-9_]+\.it@charusat\.ac\.in$/;
  
  if (studentPattern.test(email)) {
    return 'student';
  } else if (d2dPattern.test(email)) {
    return 'd2d_student';
  } else if (facultyPattern.test(email)) {
    return 'faculty';
  } else {
    return 'unknown';
  }
};

/**
 * Get validation error message for invalid email
 */
export const getEmailValidationMessage = (): string => {
  return "Please use your official Charusat email ID.";
};

/**
 * Get examples of valid email formats for help text
 */
export const getEmailExamples = (): string => {
  return "Any email ending with @charusat.edu.in or @charusat.ac.in\nExamples: john@charusat.edu.in, mary@charusat.ac.in, 21it101@charusat.edu.in";
};
