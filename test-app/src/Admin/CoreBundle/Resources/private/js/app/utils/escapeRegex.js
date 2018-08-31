export default function escapeRegex(val) {
  return val.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}
