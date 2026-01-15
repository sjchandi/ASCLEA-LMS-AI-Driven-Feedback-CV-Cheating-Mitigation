<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $gender = $this->faker->randomElement(['male', 'female']);

        $fakeRegions = [
            'Fake Region 1',
            'Fake Region 2',
            'Fake Region 3',
            'Fake Region 4',
            'Fake Region 5',
        ];

        return [
            'first_name' => $this->faker->firstName($gender),
            'last_name' => $this->faker->lastName(),
            'middle_name' => $this->faker->firstName(),
            'profile_image' => null,
            'birthdate' => $this->faker->date('Y-m-d', now()->subYears(18)),
            'gender' => $gender,
            'contact_number' => $this->faker->phoneNumber(),
            'email' => $this->faker->unique()->safeEmail(),
            'house_no' => $this->faker->buildingNumber(),
            'region' => $this->faker->randomElement($fakeRegions),
            'province' => $this->faker->state(),
            'city' => $this->faker->city(),
            'barangay' => $this->faker->streetName(),
            'password' => bcrypt('password'),
            'email_verified_at' => $this->faker->date(now()),
        ];
    }
}
