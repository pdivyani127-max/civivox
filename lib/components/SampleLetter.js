// A SAMPLE letter for demos. It is not a real or legal document.
export default function SampleLetter() {
  return (
    <div className="letter">
      <div className="watermark">SAMPLE · FOR DEMO ONLY</div>
      <p><b>[Name of the permitting authority / college / municipality]</b><br />[Address]</p>
      <p>Date: [dd/mm/yyyy]</p>
      <h2>Permission to organise an event</h2>
      <p>This is to certify that <b>[Organizer name]</b> has been granted permission to organise the event
        <b> “[Event name]”</b> at <b>[Venue]</b> on <b>[Date(s)]</b>, subject to the rules and safety guidelines of this authority.</p>
      <p>The organizer is responsible for crowd management, parking, sanitation and power arrangements for the duration of the event.</p>
      <p style={{ marginTop: 60 }}>______________________<br />[Name and designation of the authorised person]<br />[Official seal]</p>
      <p className="muted tiny">This is only an example so you can see what a permission letter looks like. Print it to PDF if you want a file to upload in the demo.</p>
    </div>
  );
}
