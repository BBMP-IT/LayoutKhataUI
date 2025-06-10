

const MaskingValue = ({ value,maskingLength }) => {
    
    if (!value || value.length <= maskingLength) {
      return value;
    }
    
    const lengthToMask = value.length - maskingLength;
    const maskedPart = 'X'.repeat(lengthToMask);
    const visiblePart = value.slice(-4);
  
    return `${maskedPart}${visiblePart}`;
  }
export default MaskingValue;
  