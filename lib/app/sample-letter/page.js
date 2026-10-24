import SampleLetter from '@/components/SampleLetter';
import LetterActions from '@/components/LetterActions';
export const metadata = { title: 'Sample permission letter' };

export default function SampleLetterPage() {
  return (
    <>
      <LetterActions />
      <SampleLetter />
    </>
  );
}
