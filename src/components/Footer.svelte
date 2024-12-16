<script lang="ts">
  import { CMSStore } from '$store/SupaStore';
  const data = $CMSStore.find((item) => item.pathname === '/')?.data;
</script>

<footer class="Footer">
  <div class="Footer__data">
    <section class="Footer__header">
      <img src="/assets/images/snu_logo-white.svg" alt="logo" />
      <div>
        <button class="CrispButton w-100" data-type="red">Book Now</button>
        <button class="CrispButton w-100" data-type="white-outline">Locate</button>
      </div>
    </section>
    <hr />
    <section class="Footer__content">
      <div class="Footer__links">
        <h3>Quick Links</h3>
        <ul>
          <li>Home</li>
          <li>Modules</li>
          <li>Events</li>
          <li>Contact</li>
          <li>Archive</li>
          <li>Equipments</li>
        </ul>
      </div>
      <hr />
      <div class="Footer__hours">
        <h3>Makerspace Hours</h3>
        <table>
          <tbody>
            {#each data.hours as hour}
              <tr>
                <td>
                  {hour.day}
                </td>
                <!-- <hr /> -->
                <td>
                  {hour.from} - {hour.to}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </section>
    <hr />
    <section class="Footer__footer">
      <p>Copyright © SNIoE Makespace, 2024</p>
    </section>
  </div>
</footer>

<style lang="scss">
  .Footer {
    @include box(100%, auto);
    @include make-flex();
    background-color: #205092;
    padding: 40px 40px;

    &__data {
      max-width: $maxWidth;
      @include box();
      @include make-flex($dir: column, $align: flex-start, $just: center);

      gap: 30px;

      & :global(* > :not(button)) {
        color: #fff;
      }
    }

    &__header {
      @include box();
      @include make-flex($align: flex-start, $just: space-between, $dir: row);

      & > img {
        width: 200px;
      }

      & > div {
        @include make-flex($align: center, $just: center, $dir: row);
        gap: 20px;
      }
    }

    hr {
      @include box(100%, 1px);
    }

    &__content {
      font-family: 'Space Grotesk', sans-serif;
      @include box();
      @include make-flex($align: flex-start, $just: space-between, $dir: row);
      padding: 0 40px;

      h3 {
        font-size: 24px;
        font-weight: 300;
        color: #fff;
        margin-bottom: 20px;
      }

      hr {
        @include box(1px, 100%);
        background: #fff;
        border: none;
      }
    }

    &__links {
      ul {
        list-style: none;
        li {
          font-size: 16px;
          font-weight: 300;
          color: #fff;
          margin-bottom: 10px;
          cursor: pointer;
          transition: color 0.3s;

          &:hover {
            color: #bc2f3e;
          }
        }
      }
    }

    &__hours {
      table {
        width: 100%;
        gap: 10px;

        tr {
          td {
            font-size: 16px;
            width: 150px;

            // background-color: red;
            font-weight: 300;
            color: #fff;
            padding: 5px 0;
          }

          td:nth-child(2) {
            text-align: right;
          }
        }
      }
    }

    &__footer {
      text-align: center;
      @include box();

      p {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 18px;
        font-weight: 300;
      }
    }
  }
</style>
