import { Link } from "react-router-dom";
import { NavBar } from "../design-system/NavBar";
import { Card } from "../design-system/Card";
import { Badge } from "../design-system/Badge";
import { Button } from "../design-system/Button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg">
      <NavBar />

      <section className="mx-auto max-w-6xl px-6 pb-16 pt-16 sm:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Badge tone="primary">For curators, hostels &amp; operators</Badge>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight text-ink-900 sm:text-5xl">
              Create trips. Connect locally.
              <br />
              Travel together.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-ink-700">
              Tripojo gives social-media travel curators the tools to package and sell group trips,
              and gives hostels, activity operators and transport providers a direct line to
              travelers who already trust the person bringing them.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => (window.location.href = "/signup?role=curator")}>
                I'm a curator
              </Button>
              <Button size="lg" variant="secondary" onClick={() => (window.location.href = "/signup?role=host")}>
                I'm a hostel / host
              </Button>
            </div>
            <p className="mt-4 text-sm text-ink-500">
              Already have an account? <Link to="/login" className="font-medium text-primary-600">Log in</Link>
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="sm:col-span-2">
              <p className="text-sm font-medium text-ink-500">Live on Tripojo</p>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="font-display text-xl font-bold text-ink-900">Himachal Backpacking Loop</p>
                  <p className="text-sm text-ink-500">Kasol · Tosh · Malana · 7 days</p>
                </div>
                <Badge tone="success">Published</Badge>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-4 text-sm">
                <span className="text-ink-500">by Ananya Explores · 82k followers</span>
                <span className="font-semibold text-ink-900">₹18,500 / person</span>
              </div>
            </Card>

            <Card>
              <p className="text-sm font-medium text-ink-500">Partner hostel</p>
              <p className="mt-2 font-display text-lg font-bold text-ink-900">Blue Pine Hostel</p>
              <p className="text-sm text-ink-500">Manali, India</p>
              <Badge tone="teal" >Verified host</Badge>
            </Card>

            <Card>
              <p className="text-sm font-medium text-ink-500">This trip's supply</p>
              <p className="mt-2 text-sm text-ink-700">2 room types · 9 units held</p>
              <p className="text-sm text-ink-700">Direct booking, no OTA fee</p>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-t border-ink-100 bg-surface py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-2xl font-bold text-ink-900">Built for the two sides that make a trip real</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Card>
              <Badge tone="primary">Curators</Badge>
              <h3 className="mt-3 font-display text-lg font-semibold">Turn your reach into a business</h3>
              <ul className="mt-3 space-y-2 text-sm text-ink-700">
                <li>· Publish a trip in minutes with a guided itinerary builder</li>
                <li>· One dashboard for bookings, earnings and messages</li>
                <li>· Verified badge once your first trip books out</li>
              </ul>
              <Button className="mt-5" onClick={() => (window.location.href = "/signup?role=curator")}>
                Start as a curator
              </Button>
            </Card>
            <Card>
              <Badge tone="teal">Hostels &amp; operators</Badge>
              <h3 className="mt-3 font-display text-lg font-semibold">Fill rooms with warm, curated demand</h3>
              <ul className="mt-3 space-y-2 text-sm text-ink-700">
                <li>· List rooms/activities and set your own pricing</li>
                <li>· Get group bookings from curators, not cold search traffic</li>
                <li>· Verification badge builds trust with every curator you work with</li>
              </ul>
              <Button className="mt-5" variant="secondary" onClick={() => (window.location.href = "/signup?role=host")}>
                Start as a host
              </Button>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
