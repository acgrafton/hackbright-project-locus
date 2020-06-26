import score_logic
import unittest

class ScoreLogic(unittest.TestCase):

  def test_points_lookup_general(self):

    self.assertEqual(score_logic.points_lookup(1000), 4)

  def test_affl_points(self):

    self.assertEqual(score_logic.affl_points(5000), 3)

  def test_conv_index(self):

    self.assertEqual(score_logic.conv_index(8, 10), 80)

if __name__ == '__main__':
  unittest.main()