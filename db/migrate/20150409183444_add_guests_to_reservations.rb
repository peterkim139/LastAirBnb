class AddGuestsToReservations < ActiveRecord::Migration
  def change
    add_column :reservations, :guests, :integer, null: false
  end
end
