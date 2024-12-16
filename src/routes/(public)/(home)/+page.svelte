<script lang="ts">
  import LocationCard from '$components/LocationCard.svelte';
  import { CMSStore } from '$store/SupaStore';
  const data = $CMSStore.find((item) => item.pathname === '/')?.data;
</script>

<div class="LandingPage">
  <section class="LandingPage__hero">
    <div class="LandingPage__content">
      {@html data.hero}
      <a href="/equipment" class="CrispButton w-auto" data-type="red">Book Now</a>
    </div>
    <!-- <div class="LandingPage__slot">
      <h3>Makerspace Hours</h3>
      <ul>
        {#each data.hours as hour}
          <li>
            {hour.day}
            <hr />
            {hour.from} - {hour.to}
          </li>
        {/each}
      </ul>
      <a href="/equipment" class="CrispButton w-100" data-type="dark-blue">Book a slot</a>
    </div> -->
  </section>
  <section class="LandingPage__about">
    <h1>About Makerspace</h1>
    <p>
      Welcome to SNIoE Makerspace—a vibrant hub dedicated to fostering innovation and excellence in
      STEAM (Science, Technology, Engineering, Arts, and Mathematics) education. Our
      state-of-the-art facility provides a collaborative environment where creativity meets
      technology, empowering students and innovators to transform ideas into reality.
    </p>
    <div class="LandingPage__about--images">
      <img src="/assets/images/makerspace-1.jpg" alt="About Makerspace" />
      <img src="/assets/images/makerspace-2.jpg" alt="About Makerspace" />
      <img src="/assets/images/makerspace-3.jpeg" alt="About Makerspace" />
    </div>
  </section>
  <section class="LandingPage__location">
    <LocationCard />
  </section>
  <section class="LandingPage__about">
    <h1>Cutting-edge facilities</h1>
    <p>
      Our makerspace is equipped with advanced, user-friendly tools and modern technologies designed
      for accessibility and affordability. Whether you're building rapid prototypes, innovating
      projects, or developing world-class research test-beds, our resources support every step of
      your journey.
    </p>
  </section>
  <section class="LandingPage__about">
    <h1>Innovation Across Disciplines</h1>
    <p>
      From sustainability and green energy to sensors, robotics, automotives, networks, and life
      sciences—our Makerspace is a one-stop destination for interdisciplinary solutions. It's a
      place where diverse fields converge, driving innovation that addresses real-world challenges.
    </p>
  </section>
  <section class="LandingPage__about">
    <h1>Training & Workshops</h1>
    <p>
      We believe in empowering our users. That's why we offer comprehensive training sessions and
      workshops to ensure safe and efficient utilization of all tools and machines. Our expert-led
      programs help you build skills and confidence, fostering a culture of continuous learning and
      growth.
    </p>
  </section>
</div>

<style lang="scss">
  .LandingPage {
    @include box(100%, 100%);
    @include make-flex($just: center);
    margin: 0;
    margin-bottom: 40px;

    &__hero {
      @include box();
      @include make-flex();
      background-image: url('/assets/images/home-bg.png');
      background-position: center;
      background-repeat: no-repeat;
      background-size: cover;
      background-color: #205092;
      padding: 4rem 20vw;
      margin: 0;
      min-height: 30rem;
    }

    &__content {
      max-width: $maxWidth;
      @include make-flex($dir: column, $just: center, $align: center);
      gap: 20px;

      & > :global(h1) {
        font-size: 36px;
        font-weight: 700;
        line-height: 1.5;
        color: #fff;
        font-family: 'Space Grotesk', sans-serif;
        font-weight: 400;

        @include respondAt(500px) {
          font-size: 32px;
        }

        @include respondAt(400px) {
          font-size: 28px;
        }
      }
      & > :global(p) {
        font-size: 20px;
        line-height: 1.5;
        text-align: center;
        color: #fff;
        font-family: 'Space Grotesk', sans-serif;
        font-weight: 300;

        @include respondAt(500px) {
          font-size: 16px;
        }

        @include respondAt(400px) {
          font-size: 15px;
        }
      }
    }

    &__about {
      max-width: $maxWidth;
      @include make-flex($dir: column, $just: center, $align: flex-start);
      gap: 20px;
      padding: 30px 20px 20px 20px;

      & > h1 {
        font-size: 32px;
        font-weight: 800;
        line-height: 48px;
        color: #205092;
        font-family: 'Space Grotesk', sans-serif;
        font-weight: 400;

        @include respondAt(500px) {
          font-size: 32px;
        }

        @include respondAt(400px) {
          font-size: 28px;
        }
      }

      & > p {
        font-size: 20px;
        line-height: 30px;
        color: #000;
        font-family: 'Space Grotesk', sans-serif;
        font-weight: 300;

        @include respondAt(500px) {
          font-size: 16px;
        }

        @include respondAt(400px) {
          font-size: 15px;
        }
      }

      &--images {
        @include box();
        @include make-flex($just: center, $align: center, $dir: row);
        flex-wrap: wrap;
        gap: 20px;

        & > img {
          @include box(auto, auto);
          max-height: 17.5rem;
          border-radius: 6px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
          aspect-ratio: 4/3;
          object-fit: cover;
          object-position: center;
          flex: 1;
        }
      }
    }

    &__location {
      max-width: $maxWidth;
      @include box(100%, auto);
      @include make-flex($just: center);
      padding: 30px 20px 20px 20px;
    }
  }
</style>
